import type { Metadata } from "next";

import BlogCard from "@/components/blog/BlogCard";
import BlogPagination from "@/components/blog/BlogPagination";
import { getBlogPageSize, getBlogsPage } from "@/lib/crm/blogs";

export const dynamic = "force-dynamic";

type BlogListingPageProps = {
  searchParams?: {
    page?: string | string[];
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
  const pageSize = getBlogPageSize();
  const { posts, pagination } = await getBlogsPage({ page, limit: pageSize });

  return (
    <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Daily Insights
          </p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Stockology Blog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Fresh posts from our writing desk. New content appears here automatically.
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-900">No blog posts yet</h2>
            <p className="mt-2 text-sm text-slate-600">
              Once posts are published in the CRM, they will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            <BlogPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasPreviousPage={pagination.hasPreviousPage}
              hasNextPage={pagination.hasNextPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
