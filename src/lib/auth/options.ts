import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { consumeRateLimit } from "@/lib/security/rateLimit";
import { safeCompareText } from "@/lib/security/compare";
import { getClientIpFromHeaders } from "@/lib/security/request";

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const adminEmail = process.env.ADMIN_EMAIL?.trim();
        const adminPassword = process.env.ADMIN_PASSWORD?.trim();

        if (!adminEmail || !adminPassword) {
          return null;
        }

        const inputEmail = normalizeEmail(credentials?.email || "");
        const inputPassword = credentials?.password || "";
        const clientIp = getClientIpFromHeaders(request?.headers);

        const loginRate = consumeRateLimit({
          bucket: "admin-login",
          key: `${clientIp}:${inputEmail || "unknown"}`,
          limit: 8,
          windowMs: 10 * 60 * 1000,
        });

        if (!loginRate.allowed) {
          return null;
        }

        const isEmailValid = safeCompareText(
          inputEmail,
          normalizeEmail(adminEmail)
        );
        const isPasswordValid = safeCompareText(inputPassword, adminPassword);

        if (!isEmailValid || !isPasswordValid) {
          return null;
        }

        return {
          id: "blog-admin",
          name: "Blog Admin",
          email: adminEmail,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
