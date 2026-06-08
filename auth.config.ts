/**
 * Edge-safe Auth.js config — used by middleware only.
 *
 * WHY: The full auth.ts imports PrismaAdapter + prisma which use Node.js APIs
 * unavailable in Edge Runtime. Middleware must use this lightweight config
 * that contains only the `authorized` callback (pure JWT, no DB calls).
 *
 * auth.ts (with PrismaAdapter) is used everywhere else (server components, API routes).
 */
import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = ["/login"];
const AUTH_API_PREFIX = "/api/auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  // No providers here — they require Node.js APIs (Prisma, bcrypt).
  // Providers are only needed at sign-in time, which doesn't run in middleware.
  providers: [],
  callbacks: {
    authorized({ request, auth: session }) {
      const { pathname } = request.nextUrl;

      if (pathname.startsWith(AUTH_API_PREFIX)) return true;
      if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;

      return !!session?.user;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
