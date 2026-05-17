export { auth as middleware } from "@/auth";

export const config = {
  // Middleware runs on all routes EXCEPT:
  // - /api/* (handled by route handlers themselves via requireAuth)
  // - /_next/* (Next.js internals)
  // - /favicon.ico and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
