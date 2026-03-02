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
    async signIn({ user }) {
      if (!user.id || !user.email) return false;

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { companyId: true },
      });

      if (!dbUser) return true;

      if (dbUser.companyId) return true;

      const companyCount = await prisma.company.count();
      if (companyCount === 0) return ONBOARDING_PATH;

      const company = await prisma.company.findFirst({
        select: { id: true },
      });
      if (company) {
        await prisma.user.update({
          where: { id: user.id },
          data: { companyId: company.id },
        });
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
  events: {
    async createUser({ user }) {
      const companyCount = await prisma.company.count();

      if (companyCount === 0) {
        return;
      }

      const company = await prisma.company.findFirst({
        select: { id: true },
      });

      if (company && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { companyId: company.id },
        });
      }
    },
  },
});
