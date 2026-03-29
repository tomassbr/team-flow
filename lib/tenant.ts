import { auth } from "@/auth";
import type { Session } from "next-auth";

type AuthedSession = Session & {
  user: NonNullable<Session["user"]>;
};

type CompanySession = AuthedSession & {
  user: AuthedSession["user"] & { companyId: string };
};

/**
 * Require authentication. Returns 401 Response if no session.
 * Use at the start of every API route.
 *
 * @example
 * const session = await requireAuth();
 * if (session instanceof Response) return session;
 */
export async function requireAuth(): Promise<AuthedSession | Response> {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session as AuthedSession;
}

/**
 * Require user to belong to a company. Returns 403 Response if user.companyId is null.
 * Call after requireAuth.
 *
 * @example
 * const session = await requireAuth();
 * if (session instanceof Response) return session;
 * const cs = await requireCompany(session);
 * if (cs instanceof Response) return cs;
 * const companyId = cs.user.companyId; // typed as string — no ! needed
 */
export async function requireCompany(
  session: AuthedSession
): Promise<CompanySession | Response> {
  if (!session.user.companyId) {
    return Response.json({ error: "Forbidden: no company" }, { status: 403 });
  }
  return session as CompanySession;
}

/**
 * Require a specific role. Returns 403 Response if the user's role does not match.
 * Call after requireCompany.
 *
 * @example
 * const roleErr = requireRole(cs, "ADMIN");
 * if (roleErr) return roleErr;
 */
export function requireRole(
  session: AuthedSession,
  role: "ADMIN" | "MEMBER"
): Response | null {
  if (session.user.role !== role) {
    return Response.json({ error: "Forbidden: insufficient role" }, { status: 403 });
  }
  return null;
}

/**
 * Typed companyId extractor — avoids non-null assertions in route handlers.
 * Only call after requireCompany has confirmed companyId is present.
 */
export function getCompanyId(session: CompanySession): string {
  return session.user.companyId;
}
