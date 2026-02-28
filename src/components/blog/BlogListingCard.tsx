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
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type BlogListingCardProps = {
  post: BlogPost;
};

export default function BlogListingCard({ post }: BlogListingCardProps) {
  return (
    <article className="group relative h-full overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.14)]">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-200/20 blur-3xl" />
      </div>
      <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
        <div className="relative h-[260px] overflow-hidden bg-slate-200">
          <Image
            src={post.featuredImage || FALLBACK_BLOG_IMAGE}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/40 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col border-t border-slate-200 px-5 py-4">
          <h2 className="line-clamp-2 text-[2rem] font-black leading-tight text-slate-900 transition-colors group-hover:text-slate-700">
            {post.title}
          </h2>
          <p className="mt-4 line-clamp-2 text-[1.05rem] font-semibold leading-snug text-slate-900">
            {post.excerpt}
          </p>
          <div className="mt-4 border-t border-slate-200 pt-3">
            <p className="text-[1.02rem] font-medium leading-tight text-slate-700">
              Posted on : <span className="font-black">{formatBlogDate(post.publishedAt)}</span>
            </p>
            {post.author ? (
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                By {post.author}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
