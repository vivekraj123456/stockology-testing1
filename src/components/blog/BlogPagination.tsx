import Link from "next/link";

type BlogPaginationProps = {
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

function createPageHref(page: number): string {
  return page <= 1 ? "/blog" : `/blog?page=${page}`;
}

export default function BlogPagination({
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
}: BlogPaginationProps) {
  return (
    <nav
      className="mt-10 flex items-center justify-center gap-3"
      aria-label="Blog pagination"
    >
      {hasPreviousPage ? (
        <Link
          href={createPageHref(page - 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400">
          Previous
        </span>
      )}

      <span className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
        Page {page} of {Math.max(totalPages, 1)}
      </span>

      {hasNextPage ? (
        <Link
          href={createPageHref(page + 1)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
        >
          Next
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400">
          Next
        </span>
      )}
    </nav>
  );
}
