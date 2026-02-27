import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { authOptions } from "@/lib/auth/options";

type AdminLoginPageProps = {
  searchParams?: {
    callbackUrl?: string | string[];
  };
};

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Login page for Stockology blog portal admins.",
  robots: {
    index: false,
    follow: false,
  },
};

function resolveCallbackUrl(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw || !raw.startsWith("/")) {
    return "/admin";
  }

  return raw;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/admin");
  }

  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#99f6e4,transparent_34%),radial-gradient(circle_at_80%_10%,#bbf7d0,transparent_28%),linear-gradient(170deg,#f8fafc_0%,#ecfeff_45%,#f0fdf4_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,#cbd5e133_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e133_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <AdminLoginForm
          callbackUrl={resolveCallbackUrl(searchParams?.callbackUrl)}
        />
      </div>
    </section>
  );
}
