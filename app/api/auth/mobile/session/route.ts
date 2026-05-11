import { decode } from "@auth/core/jwt";
import { prisma } from "@/lib/db";
import { MOBILE_COOKIE_NAME } from "../_session";

/**
 * GET /api/auth/mobile/session
 *
 * Validuje mobilní session token a vrací aktuální data uživatele z DB.
 * Token se posílá jako Authorization: Bearer (preferováno) nebo Cookie header.
 *
 * Proč vlastní endpoint místo GET /api/auth/session:
 * NextAuth v5 + PrismaAdapter může ignorovat manuálně vytvořený JWT token.
 * Tento endpoint dekóduje token přímo přes @auth/core/jwt decode.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const cookieHeader = request.headers.get("cookie") ?? "";

  let rawToken: string | null = null;

  // Preferuj Authorization: Bearer (iOS NSHTTPCookieStorage nemodifikuje tento header)
  if (authHeader.startsWith("Bearer ")) {
    rawToken = authHeader.slice(7).trim();
  } else {
    // Záloha: Cookie header (regex s escapovanou tečkou)
    const escapedName = MOBILE_COOKIE_NAME.replace(/\./g, "\\.");
    const cookieMatch = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`)
    );
    if (cookieMatch?.[1]) {
      rawToken = cookieMatch[1].trim();
    }
  }

  if (!rawToken) {
    console.warn("[mobile/session] no token in Authorization or Cookie header");
    return Response.json({ user: null }, { status: 401 });
  }

  let decoded: { sub?: string; id?: string } | null = null;
  try {
    decoded = await decode({
      token: rawToken,
      secret: process.env.AUTH_SECRET!,
      salt: MOBILE_COOKIE_NAME,
    });
  } catch (e) {
    console.warn("[mobile/session] decode failed:", e instanceof Error ? e.message : e);
    return Response.json({ user: null }, { status: 401 });
  }

  const userId = decoded?.id ?? decoded?.sub;
  if (!userId) {
    console.warn("[mobile/session] decoded token has no id/sub:", decoded);
    return Response.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      companyId: true,
      role: true,
    },
  });

  if (!user) {
    console.warn("[mobile/session] user not found in DB for id:", userId);
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({ user });
}
