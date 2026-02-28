"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import BlogUploadForm, {
  type BlogApiEntity,
  type BlogFormState,
} from "@/components/admin/BlogUploadForm";

type AdminBlogManagerProps = {
  adminEmail: string;
};

type ListBlogsResponse = {
  success?: boolean;
  error?: string;
  blogs?: BlogApiEntity[];
};

type DeleteBlogResponse = {
  success?: boolean;
  error?: string;
};

function formatDate(isoDate: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }

  return parsed.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toFormState(blog: BlogApiEntity): BlogFormState {
  return {
    title: blog.title,
    keywords: blog.keywords ?? [],
    image: blog.image,
    excerpt: blog.excerpt,
    content: blog.content,
    author: blog.author,
  };
}

function sortPostsByDate(posts: BlogApiEntity[]): BlogApiEntity[] {
  return [...posts].sort((first, second) => {
    const firstTimestamp = Date.parse(first.createdAt);
    const secondTimestamp = Date.parse(second.createdAt);
    return secondTimestamp - firstTimestamp;
  });
}

export default function AdminBlogManager({ adminEmail }: AdminBlogManagerProps) {
  const [posts, setPosts] = useState<BlogApiEntity[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [listError, setListError] = useState("");
  const [editingPost, setEditingPost] = useState<BlogApiEntity | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string } | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (!editingPost) {
      document.body.style.overflow = "";
      return;
    }

    const styleElement = document.createElement("style");
    styleElement.id = "admin-modal-hide-nav";
    styleElement.innerHTML = `
      header, nav, .fixed.top-0 {
        display: none !important;
      }
    `;
    document.head.appendChild(styleElement);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
      const existingStyle = document.getElementById("admin-modal-hide-nav");
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [editingPost]);

  const fetchPosts = useCallback(async () => {
    setListError("");

    try {
      const response = await fetch("/api/blog?page=1&limit=100", {
        cache: "no-store",
      });

      const payload = (await response.json()) as ListBlogsResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to load blog posts.");
      }

      setPosts(sortPostsByDate(payload.blogs ?? []));
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Failed to load blog posts.");
    } finally {
      setIsLoadingPosts(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  function handleRefresh() {
    setIsRefreshing(true);
    void fetchPosts();
  }

  function handleCreateSuccess(blog: BlogApiEntity) {
    setPosts((prev) => sortPostsByDate([blog, ...prev.filter((post) => post.id !== blog.id)]));
    setToastMessage({
      title: "Successfully Published",
      desc: "Your new blog post is now live and visible to the public."
    });
  }

  function handleUpdateSuccess(blog: BlogApiEntity) {
    setPosts((prev) =>
      sortPostsByDate(prev.map((post) => (post.id === blog.id ? blog : post)))
    );
    setToastMessage({
      title: "Changes Saved",
      desc: "Your edits have been securely saved and are now live."
    });
    setEditingPost(null); // Close the modal on save
  }

  async function handleDelete(post: BlogApiEntity) {
    const confirmed = window.confirm(
      `Delete "${post.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingPostId(post.id);
    setListError("");

    try {
      const response = await fetch(`/api/blog/${post.id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as DeleteBlogResponse;

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to delete blog post.");
      }

      setPosts((prev) => prev.filter((item) => item.id !== post.id));
      if (editingPost?.id === post.id) {
        setEditingPost(null);
      }
    } catch (error) {
      setListError(error instanceof Error ? error.message : "Failed to delete blog post.");
    } finally {
      setDeletingPostId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-[28px] border border-slate-200/80 bg-white/85 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.07)] backdrop-blur sm:grid-cols-3 sm:p-7">
        <div className="sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Admin Profile
          </p>
          <h2 className="mt-2 break-all text-xl font-black text-slate-900 sm:text-2xl">
            {adminEmail}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Manage published posts: create, edit, and delete from one dashboard.
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-2xl border border-teal-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 px-4 py-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Total Posts
          </span>
          <span className="mt-1 text-3xl font-black text-emerald-900">{posts.length}</span>
        </div>
      </section>

      <div className="space-y-8">
        <section className="space-y-8">
          <div>
            <h3 className="mb-4 text-lg font-black uppercase tracking-[0.13em] text-slate-800">
              Create New Post
            </h3>
            <BlogUploadForm mode="create" onSuccess={handleCreateSuccess} />
          </div>

          {editingPost ? (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm sm:p-6">
              <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[30px] bg-white shadow-2xl">
                <BlogUploadForm
                  mode="edit"
                  blogId={editingPost.id}
                  initialValues={toFormState(editingPost)}
                  onSuccess={handleUpdateSuccess}
                  onCancel={() => setEditingPost(null)}
                />
              </div>
            </div>
          ) : null}
        </section>

        <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_14px_38px_rgba(15,23,42,0.07)] backdrop-blur sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black uppercase tracking-[0.13em] text-slate-800">
              Published Posts
            </h3>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {listError ? (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {listError}
            </div>
          ) : null}

          {isLoadingPosts ? (
            <p className="text-sm text-slate-600">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-sm text-slate-600">
              No posts found. Publish your first post from the form.
            </p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">{post.title}</h4>
                    <span className="rounded-full border border-slate-300 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {post.slug}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
                  <p className="mt-2 text-[11px] text-slate-500">Author: {post.author}</p>
                  {post.keywords && post.keywords.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {post.keywords.map((keyword) => (
                        <span
                          key={`${post.id}-${keyword}`}
                          className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="rounded-full border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditingPost(post)}
                      className="rounded-full border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(post)}
                      disabled={deletingPostId === post.id}
                      className="rounded-full border border-red-300 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-700 transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingPostId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[99999] flex max-w-sm items-start gap-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl ring-1 ring-black/5 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-bold text-slate-900">{toastMessage.title}</p>
            <p className="mt-1 text-xs text-slate-500">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
