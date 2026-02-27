import Link from "next/link";

export default function BlogNotFound() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto flex min-h-[55vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Blog post not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          This post may have been removed or is not published yet in the CRM.
        </p>
        <Link
          href="/blog"
          className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Back to Blog
        </Link>
      </div>
    </section>
  );
}
