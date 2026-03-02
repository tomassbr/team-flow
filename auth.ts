import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextResponse } from "next/server";
import { prisma } from "./lib/db";

const ONBOARDING_PATH = "/onboarding";
const DASHBOARD_PATH = "/dashboard";

const PUBLIC_PATHS = ["/login", "/onboarding"];
const AUTH_API_PREFIX = "/api/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith(AUTH_API_PREFIX)) return true;
      if (PUBLIC_PATHS.includes(pathname)) return true;

      if (!auth?.user) return false;

      if (!auth.user.companyId) {
        return NextResponse.redirect(new URL(ONBOARDING_PATH, request.url));
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      const resolvedUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
      if (resolvedUrl.startsWith(baseUrl)) {
        return resolvedUrl;
      }
      return baseUrl + DASHBOARD_PATH;
    },
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { companyId: true, role: true },
        });
        session.user.id = user.id;
        session.user.companyId = dbUser?.companyId ?? null;
        session.user.role = dbUser?.role ?? "MEMBER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
});
