import type { Metadata } from "next";
import Link from "next/link";

import BlogListingCard from "@/components/blog/BlogListingCard";
import BlogPagination from "@/components/blog/BlogPagination";
import { BLOG_FILTER_KEYWORDS, resolveBlogKeyword } from "@/lib/blogs/keywords";
import { getBlogPageSize, getBlogsPage } from "@/lib/crm/blogs";

export const dynamic = "force-dynamic";

type BlogListingPageProps = {
  searchParams?: {
    page?: string | string[];
    keyword?: string | string[];
  };
};

function getCurrentPage(searchParams: BlogListingPageProps["searchParams"]): number {
  const pageValue = searchParams?.page;
  const pageInput = Array.isArray(pageValue) ? pageValue[0] : pageValue;
  const parsed = Number(pageInput);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function getCurrentKeyword(searchParams: BlogListingPageProps["searchParams"]): string {
  const keywordValue = searchParams?.keyword;
  const keywordInput = Array.isArray(keywordValue) ? keywordValue[0] : keywordValue;
  return resolveBlogKeyword(keywordInput || null);
}

function createKeywordHref(keyword: string): string {
  if (keyword === "All") {
    return "/blog";
  }

  return `/blog?keyword=${encodeURIComponent(keyword)}`;
}

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Read the latest Stockology blogs and market insights from our editorial team.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: "https://stockology.in/blog",
    title: "Stockology Blog",
    description:
      "Daily market insights and educational posts published by the Stockology team.",
    images: ["/stklogo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stockology Blog",
    description:
      "Daily market insights and educational posts published by the Stockology team.",
    images: ["/stklogo.png"],
  },
};

export default async function BlogListingPage({ searchParams }: BlogListingPageProps) {
  const page = getCurrentPage(searchParams);
  const keyword = getCurrentKeyword(searchParams);
  const pageSize = getBlogPageSize();
  const { posts, pagination } = await getBlogsPage({ page, limit: pageSize, keyword });

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#f9fafb_0%,#ffffff_48%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,#e2e8f026_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f026_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Stockology Blogs
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Fresh posts from our writing desk. Start your market research with our latest blogs and insights.
          </p>
        </header>

        <div className="mt-7 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {BLOG_FILTER_KEYWORDS.map((tab) => (
            <Link
              key={tab}
              href={createKeywordHref(tab)}
              className={
                tab === keyword
                  ? "inline-flex shrink-0 rounded-full border border-slate-900 bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
                  : "inline-flex shrink-0 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
              }
            >
              {tab}
            </Link>
          ))}
        </div>

        {posts.length === 0 ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_14px_35px_rgba(15,23,42,0.08)]">
            <h2 className="text-xl font-semibold text-slate-900">No blog posts yet</h2>
          </div>
        ) : (
          <>
            <div className="mx-auto mt-7 grid max-w-[1180px] gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <BlogListingCard key={post.id} post={post} />
              ))}
            </div>

            <BlogPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasPreviousPage={pagination.hasPreviousPage}
              hasNextPage={pagination.hasNextPage}
              keyword={keyword}
            />
          </>
        )}
      </div>
    </section>
  );
}
