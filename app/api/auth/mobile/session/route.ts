import { decode } from "@auth/core/jwt";
import { prisma } from "@/lib/db";
import { MOBILE_COOKIE_NAME } from "../_session";

/**
 * GET /api/auth/mobile/session
 *
 * Validuje mobilní session token (zaslaný v Cookie nebo Authorization: Bearer hlavičce)
 * a vrací aktuální data uživatele přímo z DB.
 *
 * Proč vlastní endpoint místo GET /api/auth/session:
 * NextAuth v5 s PrismaAdapterem může v database-session módu ignorovat JWT cookie
 * zaslaný manuálně z mobilního klienta. Tento endpoint dekóduje token přímo
 * pomocí @auth/core/jwt a vrátí čerstvá data z DB.
 */
export async function GET(request: Request) {
  // Token může přijít jako Cookie nebo Authorization: Bearer
  const cookieHeader = request.headers.get("cookie") ?? "";
  const authHeader = request.headers.get("authorization") ?? "";

  let rawToken: string | null = null;

  const cookieMatch = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${MOBILE_COOKIE_NAME}=([^;]+)`)
  );
  if (cookieMatch?.[1]) {
    rawToken = cookieMatch[1];
  } else if (authHeader.startsWith("Bearer ")) {
    rawToken = authHeader.slice(7);
  }

  if (!rawToken) {
    return Response.json({ user: null }, { status: 401 });
  }

  let decoded: { sub?: string; id?: string } | null = null;
  try {
    decoded = await decode({
      token: rawToken,
      secret: process.env.AUTH_SECRET!,
      salt: MOBILE_COOKIE_NAME,
    });
  } catch {
    return Response.json({ user: null }, { status: 401 });
  }

  const userId = decoded?.id ?? decoded?.sub;
  if (!userId) {
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
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({ user });
}
