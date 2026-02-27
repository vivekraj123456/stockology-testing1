import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import AdminBlogManager from "@/components/admin/AdminBlogManager";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import { authOptions } from "@/lib/auth/options";

export const metadata: Metadata = {
  title: "Admin Blog Dashboard",
  description: "Manage blog posts in the Stockology admin portal.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login?callbackUrl=/admin");
  }

  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_10%_20%,#99f6e4,transparent_32%),radial-gradient(circle_at_88%_8%,#fef08a,transparent_30%),linear-gradient(180deg,#f8fafc_0%,#ecfeff_50%,#f8fafc_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,#94a3b833_1px,transparent_1px),linear-gradient(to_bottom,#94a3b833_1px,transparent_1px)] [background-size:26px_26px]" />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <header className="mb-8 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-emerald-300 bg-emerald-100/70 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800">
                Blog Admin Portal
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Blog Management Dashboard
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Create, review, edit, and delete posts from one premium workspace.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <p className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-600">
                Signed in as {session.user.email}
              </p>
              <AdminSignOutButton />
            </div>
          </div>
        </header>

        <AdminBlogManager adminEmail={session.user.email ?? "admin"} />
      </div>
    </section>
  );
}
