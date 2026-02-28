import Link from "next/link";

type BlogPaginationProps = {
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  keyword?: string;
};

function createPageHref(page: number, keyword?: string): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (keyword && keyword.toLowerCase() !== "all") {
    params.set("keyword", keyword);
  }

  const query = params.toString();
  return query ? `/blog?${query}` : "/blog";
}

export default function BlogPagination({
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  keyword,
}: BlogPaginationProps) {
  return (
    <nav
      className="mt-12 flex items-center justify-center gap-3"
      aria-label="Blog pagination"
    >
      {hasPreviousPage ? (
        <Link
          href={createPageHref(page - 1, keyword)}
          className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow"
        >
          Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-400">
          Previous
        </span>
      )}

      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700">
        Page {page} of {Math.max(totalPages, 1)}
      </span>

      {hasNextPage ? (
        <Link
          href={createPageHref(page + 1, keyword)}
          className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow"
        >
          Next
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-400">
          Next
        </span>
      )}
    </nav>
  );
}
