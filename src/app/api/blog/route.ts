import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth/options";
import { slugify } from "@/lib/blogs/content";
import { isAllKeyword, resolveBlogKeyword } from "@/lib/blogs/keywords";
import {
  normalizeBlogPayload,
  type BlogInputPayload,
} from "@/lib/blogs/validation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { guardWriteRequest } from "@/lib/security/api";
import Blog, { type BlogDocument } from "@/models/Blog";

const BLOG_WRITE_RATE_LIMIT = {
  bucket: "blog-write-post",
  limit: 40,
  windowMs: 10 * 60 * 1000,
};

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toPublicBlog(blog: BlogDocument & { id: string }) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    keywords: blog.keywords ?? [],
    content: blog.content,
    excerpt: blog.excerpt,
    image: blog.image,
    author: blog.author,
    createdAt: blog.createdAt.toISOString(),
  };
}

async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title) || `blog-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 1;

  while (await Blog.exists({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function POST(request: Request) {
  const writeGuardResponse = guardWriteRequest(request, BLOG_WRITE_RATE_LIMIT);
  if (writeGuardResponse) {
    return writeGuardResponse;
  }

  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized. Please sign in to publish blogs.",
      },
      { status: 401 }
    );
  }

  let payload: BlogInputPayload;

  try {
    payload = (await request.json()) as BlogInputPayload;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const normalized = normalizeBlogPayload(payload);

  if (!normalized.ok) {
    return NextResponse.json(
      {
        success: false,
        error: normalized.error,
      },
      { status: 400 }
    );
  }

  const { title, keywords, content, excerpt, image, author } = normalized.data;

  try {
    await connectToDatabase();

    const slug = await generateUniqueSlug(title);

    const createdBlog = await Blog.create({
      title,
      slug,
      keywords,
      content,
      excerpt,
      image,
      author,
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${createdBlog.slug}`);

    return NextResponse.json(
      {
        success: true,
        blog: toPublicBlog({
          ...(createdBlog.toObject() as BlogDocument),
          id: createdBlog.id,
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    const missingMongoUri =
      error instanceof Error && error.message.includes("MONGODB_URI");

    if (missingMongoUri) {
      return NextResponse.json(
        {
          success: false,
          error: "Server is missing MONGODB_URI configuration.",
        },
        { status: 500 }
      );
    }

    const duplicateSlugError =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000;

    if (duplicateSlugError) {
      return NextResponse.json(
        { success: false, error: "A blog with this slug already exists. Please retry." },
        { status: 409 }
      );
    }

    console.error("Failed to create blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish blog." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const slug = readString(searchParams.get("slug"));
  const keyword = resolveBlogKeyword(readString(searchParams.get("keyword")));
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : 10;

  try {
    await connectToDatabase();

    if (slug) {
      const blog = await Blog.findOne({ slug }).exec();

      if (!blog) {
        return NextResponse.json(
          { success: false, error: "Blog not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        blog: toPublicBlog({
          ...(blog.toObject() as BlogDocument),
          id: blog.id,
        }),
      });
    }

    const skip = (safePage - 1) * safeLimit;
    const query = isAllKeyword(keyword) ? {} : { keywords: keyword };

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .exec(),
      Blog.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      blogs: blogs.map((blog) =>
        toPublicBlog({
          ...(blog.toObject() as BlogDocument),
          id: blog.id,
        })
      ),
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / safeLimit)),
        hasNextPage: safePage * safeLimit < total,
        hasPreviousPage: safePage > 1,
      },
    });
  } catch (error) {
    const missingMongoUri =
      error instanceof Error && error.message.includes("MONGODB_URI");

    if (missingMongoUri) {
      return NextResponse.json(
        {
          success: false,
          error: "Server is missing MONGODB_URI configuration.",
        },
        { status: 500 }
      );
    }

    console.error("Failed to fetch blogs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs." },
      { status: 500 }
    );
  }
}
