"use client";

import { signOut } from "next-auth/react";

export default function AdminSignOutButton() {
  return (
    <button
      type="button"
      onClick={() =>
        signOut({
          callbackUrl: "/admin/login",
        })
      }
      className="rounded-full border border-slate-300 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow"
    >
      Sign Out
    </button>
  );
}
