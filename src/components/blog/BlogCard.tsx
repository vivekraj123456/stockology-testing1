import Image from "next/image";
import Link from "next/link";

import { FALLBACK_BLOG_IMAGE } from "@/lib/crm/blogs";
import type { BlogPost } from "@/types/blog";

function formatBlogDate(isoDate: string): string {
  const parsedDate = new Date(isoDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type BlogCardProps = {
  post: BlogPost;
};

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 p-3">
          <Image
            src={post.featuredImage || FALLBACK_BLOG_IMAGE}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {formatBlogDate(post.publishedAt)}
          </p>
          <h2 className="mt-3 line-clamp-2 text-xl font-bold text-slate-900">
            {post.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
            {post.excerpt}
          </p>
          <span className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-700">
            Read article
          </span>
        </div>
      </Link>
    </article>
  );
}
