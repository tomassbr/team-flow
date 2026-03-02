import { auth } from "@/auth";

/**
 * Get the current session. Returns null if not authenticated.
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function getSession() {
  return auth();
}

/**
 * Require authentication. Throws/redirects if not authenticated.
 * Use when a route or action must have a logged-in user.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Require user to belong to a company. Redirects to onboarding if no company.
 * Use for app routes that need company context.
 */
export async function requireCompany() {
  const session = await requireAuth();
  if (!session.user.companyId) {
    return { session, redirectTo: "/onboarding" as const };
  }
  return { session, redirectTo: null };
}
