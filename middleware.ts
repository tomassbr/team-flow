import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Use the edge-safe config (no Prisma) so middleware can run in Edge Runtime.
// The full auth.ts (with PrismaAdapter) is used only in server components and API routes.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Middleware runs on all routes EXCEPT:
  // - /api/* (handled by route handlers themselves via requireAuth)
  // - /_next/* (Next.js internals)
  // - /favicon.ico and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
