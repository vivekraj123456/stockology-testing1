import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth/options";
import { slugify } from "@/lib/blogs/content";
import {
  normalizeBlogPayload,
  type BlogInputPayload,
} from "@/lib/blogs/validation";
import { connectToDatabase } from "@/lib/db/mongoose";
import { guardWriteRequest } from "@/lib/security/api";
import Blog, { type BlogDocument } from "@/models/Blog";

const BLOG_WRITE_RATE_LIMIT = {
  bucket: "blog-write-manage",
  limit: 60,
  windowMs: 10 * 60 * 1000,
};

type RouteParams = {
  params: {
    id: string;
  };
};

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

async function ensureAuthorized() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized. Please sign in to manage blogs.",
      },
      { status: 401 }
    );
  }

  return null;
}

async function generateUniqueSlug(title: string, currentId: string): Promise<string> {
  const baseSlug = slugify(title) || `blog-${Date.now()}`;
  let slug = baseSlug;
  let suffix = 1;

  while (await Blog.exists({ slug, _id: { $ne: currentId } })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function isMissingMongoUriError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("MONGODB_URI");
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    await connectToDatabase();
    const blog = await Blog.findById(params.id).exec();

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
  } catch (error) {
    if (isMissingMongoUriError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: "Server is missing MONGODB_URI configuration.",
        },
        { status: 500 }
      );
    }

    console.error("Failed to fetch blog by id:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  const writeGuardResponse = guardWriteRequest(request, BLOG_WRITE_RATE_LIMIT);
  if (writeGuardResponse) {
    return writeGuardResponse;
  }

  const unauthorizedResponse = await ensureAuthorized();
  if (unauthorizedResponse) {
    return unauthorizedResponse;
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
    const existingBlog = await Blog.findById(params.id).exec();

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found." },
        { status: 404 }
      );
    }

    const previousSlug = existingBlog.slug;
    const nextSlug =
      existingBlog.title === title
        ? existingBlog.slug
        : await generateUniqueSlug(title, existingBlog.id);

    existingBlog.title = title;
    existingBlog.slug = nextSlug;
    existingBlog.keywords = keywords;
    existingBlog.content = content;
    existingBlog.excerpt = excerpt;
    existingBlog.image = image;
    existingBlog.author = author;
    await existingBlog.save();

    revalidatePath("/blog");
    revalidatePath(`/blog/${previousSlug}`);
    revalidatePath(`/blog/${existingBlog.slug}`);

    return NextResponse.json({
      success: true,
      blog: toPublicBlog({
        ...(existingBlog.toObject() as BlogDocument),
        id: existingBlog.id,
      }),
    });
  } catch (error) {
    if (isMissingMongoUriError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: "Server is missing MONGODB_URI configuration.",
        },
        { status: 500 }
      );
    }

    console.error("Failed to update blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update blog." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const writeGuardResponse = guardWriteRequest(_request, BLOG_WRITE_RATE_LIMIT);
  if (writeGuardResponse) {
    return writeGuardResponse;
  }

  const unauthorizedResponse = await ensureAuthorized();
  if (unauthorizedResponse) {
    return unauthorizedResponse;
  }

  try {
    await connectToDatabase();
    const deletedBlog = await Blog.findByIdAndDelete(params.id).exec();

    if (!deletedBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found." },
        { status: 404 }
      );
    }

    revalidatePath("/blog");
    revalidatePath(`/blog/${deletedBlog.slug}`);

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully.",
    });
  } catch (error) {
    if (isMissingMongoUriError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: "Server is missing MONGODB_URI configuration.",
        },
        { status: 500 }
      );
    }

    console.error("Failed to delete blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog." },
      { status: 500 }
    );
  }
}
