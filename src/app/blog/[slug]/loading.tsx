export default function BlogDetailLoading() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-3 w-36 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-11 w-full animate-pulse rounded bg-slate-200" />
        <div className="mt-8 aspect-[16/9] animate-pulse rounded-2xl bg-slate-200" />

        <div className="mt-8 space-y-4">
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </section>
  );
}
