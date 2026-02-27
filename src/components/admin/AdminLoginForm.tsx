"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type AdminLoginFormProps = {
  callbackUrl: string;
};

export default function AdminLoginForm({ callbackUrl }: AdminLoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    if (!result || result.error) {
      setError("Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur"
    >
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-800 px-6 py-7 text-white sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
          Stockology
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
          Blog Portal Login
        </h1>
        <p className="mt-2 text-sm text-slate-200">
          Sign in with admin credentials to access content operations.
        </p>
      </div>

      <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            placeholder="xyz@email.com"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            placeholder="Enter admin password"
          />
        </label>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white shadow-lg transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:from-emerald-300 disabled:to-teal-300"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </form>
  );
}
