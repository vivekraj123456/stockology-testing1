export default function BlogListingLoading() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mx-auto mt-4 h-10 w-72 animate-pulse rounded bg-slate-200" />
        <div className="mx-auto mt-3 h-4 w-full max-w-2xl animate-pulse rounded bg-slate-200" />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-[16/10] animate-pulse bg-slate-200" />
              <div className="p-5">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-6 w-full animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-4 w-4/6 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
