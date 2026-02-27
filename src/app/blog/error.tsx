"use client";

import { useEffect } from "react";

type BlogListingErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BlogListingError({ error, reset }: BlogListingErrorProps) {
  useEffect(() => {
    console.error("Blog listing route error:", error);
  }, [error]);

  return (
    <section className="bg-slate-50">
      <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Unable to load blog posts</h1>
        <p className="mt-3 text-sm text-slate-600">
          There was a temporary issue fetching data from the CRM API.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          Try Again
        </button>
      </div>
    </section>
  );
}
