import { auth } from "@/auth";
import type { Session } from "next-auth";

/**
 * Require authentication. Returns 401 Response if no session.
 * Use at the start of every API route.
 *
 * @example
 * const session = await requireAuth();
 * if (session instanceof Response) return session;
 */
export async function requireAuth(): Promise<Session | Response> {
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}

/**
 * Require user to belong to a company. Returns 403 Response if user.companyId is null.
 * Call after requireAuth.
 *
 * @example
 * const session = await requireAuth();
 * if (session instanceof Response) return session;
 * const companySession = await requireCompany(session);
 * if (companySession instanceof Response) return companySession;
 */
export async function requireCompany(
  session: Session
): Promise<Session | Response> {
  if (!session.user.companyId) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session;
}
