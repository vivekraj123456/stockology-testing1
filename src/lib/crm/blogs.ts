import type { HydratedDocument } from "mongoose";

import { createExcerpt, slugify } from "@/lib/blogs/content";
import { MOCK_BLOG_POSTS } from "@/lib/blogs/mockData";
import { connectToDatabase } from "@/lib/db/mongoose";
import Blog, { type BlogDocument } from "@/models/Blog";
import type { BlogListResult, BlogPagination, BlogPost } from "@/types/blog";

const DEFAULT_PAGE_SIZE = 6;

export const FALLBACK_BLOG_IMAGE =
  "https://via.placeholder.com/1200x675.png?text=Stockology+Blog";

function shouldUseMockBlogs(): boolean {
  const configured = process.env.CRM_BLOG_USE_MOCK?.trim().toLowerCase();

  if (configured === "true" || configured === "1" || configured === "yes") {
    return true;
  }

  if (configured === "false" || configured === "0" || configured === "no") {
    return false;
  }

  return !process.env.MONGODB_URI?.trim();
}

function shouldFallbackToMockOnDbError(): boolean {
  const configured = process.env.CRM_BLOG_FALLBACK_TO_MOCK?.trim().toLowerCase();
  return configured !== "false" && configured !== "0" && configured !== "no";
}

function sortPostsByDateDesc(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((first, second) => {
    const firstTimestamp = Date.parse(first.publishedAt);
    const secondTimestamp = Date.parse(second.publishedAt);
    return secondTimestamp - firstTimestamp;
  });
}

function mapDbBlogToBlogPost(doc: HydratedDocument<BlogDocument>): BlogPost {
  return {
    id: doc.id,
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt || createExcerpt(doc.content),
    content: doc.content,
    featuredImage: doc.image || null,
    publishedAt: doc.createdAt.toISOString(),
    updatedAt: null,
    seoTitle: null,
    seoDescription: null,
    seoImage: null,
    author: doc.author,
  };
}

function getMockPosts(): BlogPost[] {
  return sortPostsByDateDesc(MOCK_BLOG_POSTS);
}

function getMockPagination(page: number, limit: number, total: number): BlogPagination {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

function getMockBlogsPageResult(page: number, limit: number): BlogListResult {
  const posts = getMockPosts();
  const start = (page - 1) * limit;
  const paginatedPosts = posts.slice(start, start + limit);

  return {
    posts: paginatedPosts,
    pagination: getMockPagination(page, limit, posts.length),
  };
}

function getMockBlogBySlug(slug: string): BlogPost | null {
  return getMockPosts().find((post) => post.slug === slug) ?? null;
}

export function getBlogPageSize(): number {
  const configured = Number(process.env.CRM_BLOG_PAGE_SIZE);
  if (Number.isFinite(configured) && configured > 0) {
    return Math.min(Math.floor(configured), 50);
  }

  return DEFAULT_PAGE_SIZE;
}

async function getBlogsFromDatabase(page: number, limit: number): Promise<BlogListResult> {
  await connectToDatabase();

  const skip = (page - 1) * limit;

  const [blogDocs, total] = await Promise.all([
    Blog.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
    Blog.countDocuments({}),
  ]);

  const posts = blogDocs.map(mapDbBlogToBlogPost);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getBlogsPage({
  page,
  limit = getBlogPageSize(),
}: {
  page: number;
  limit?: number;
}): Promise<BlogListResult> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : getBlogPageSize();

  if (shouldUseMockBlogs()) {
    return getMockBlogsPageResult(safePage, safeLimit);
  }

  try {
    return await getBlogsFromDatabase(safePage, safeLimit);
  } catch (error) {
    if (shouldFallbackToMockOnDbError()) {
      console.warn("Mongo blog query failed. Falling back to mock blog data.", error);
      return getMockBlogsPageResult(safePage, safeLimit);
    }
    throw error;
  }
}

export async function getBlogBySlug(inputSlug: string): Promise<BlogPost | null> {
  const slug = slugify(inputSlug);

  if (!slug) {
    return null;
  }

  if (shouldUseMockBlogs()) {
    return getMockBlogBySlug(slug);
  }

  try {
    await connectToDatabase();
    const blogDoc = await Blog.findOne({ slug }).exec();
    return blogDoc ? mapDbBlogToBlogPost(blogDoc) : null;
  } catch (error) {
    if (shouldFallbackToMockOnDbError()) {
      console.warn("Mongo blog detail query failed. Falling back to mock blog data.", error);
      return getMockBlogBySlug(slug);
    }
    throw error;
  }
}

export async function getRelatedBlogs(slug: string, limit = 3): Promise<BlogPost[]> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 3;
  const { posts } = await getBlogsPage({ page: 1, limit: Math.max(12, safeLimit + 4) });
  return posts.filter((post) => post.slug !== slug).slice(0, safeLimit);
}
