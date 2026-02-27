import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import BlogCard from "@/components/blog/BlogCard";
import { FALLBACK_BLOG_IMAGE, getBlogBySlug, getRelatedBlogs } from "@/lib/crm/blogs";

type BlogDetailPageProps = {
  params: {
    slug: string;
  };
};

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

function isHtmlContent(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

function stripHtml(content: string): string {
  return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const post = await getBlogBySlug(params.slug);

  if (!post) {
    return {
      title: "Blog Not Found",
      description: "The requested blog post is not available.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt || stripHtml(post.content).slice(0, 160);
  const image = post.seoImage || post.featuredImage || FALLBACK_BLOG_IMAGE;
  const url = `https://stockology.in/blog/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const post = await getBlogBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const renderHtml = isHtmlContent(post.content);
  const relatedPosts = await getRelatedBlogs(post.slug, 3);

  return (
    <article className="bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          {formatBlogDate(post.publishedAt)}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          <div className="relative h-[260px] w-full sm:h-[380px] lg:h-[500px]">
            <Image
              src={post.featuredImage || FALLBACK_BLOG_IMAGE}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-contain p-4"
            />
          </div>
        </div>

        <div className="mt-8 text-base leading-8 text-slate-700 [&_a]:font-medium [&_a]:text-emerald-700 [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-slate-900 [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900 [&_li]:mb-2 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-6 [&_strong]:font-semibold [&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6">
          {renderHtml ? (
            // Content is provided by a trusted internal CRM source.
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          ) : (
            <div className="whitespace-pre-line">{post.content}</div>
          )}
        </div>

        {relatedPosts.length > 0 ? (
          <section className="mt-14 border-t border-slate-200 pt-10">
            <h2 className="text-2xl font-bold text-slate-900">Related Blogs</h2>
            <p className="mt-2 text-sm text-slate-600">
              Explore more articles from our market education desk.
            </p>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
