import { prisma } from "@/lib/db";
import { createMobileSessionToken, MOBILE_COOKIE_NAME } from "../_session";

/**
 * POST /api/auth/mobile/dev
 *
 * Dev-only credentials sign-in for mobile. Verifies email + password against
 * DEV_AUTH_EMAIL / DEV_AUTH_PASSWORD env vars, then returns a NextAuth-compatible
 * session token — same format as /api/auth/mobile/google and /apple.
 *
 * Blocked in production. Only for local development and testing.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "Not available in production" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.password) {
    return Response.json({ error: "Missing email or password" }, { status: 400 });
  }

  const devEmail = process.env.DEV_AUTH_EMAIL;
  const devPassword = process.env.DEV_AUTH_PASSWORD;

  if (!devEmail || !devPassword) {
    return Response.json(
      { error: "DEV_AUTH_EMAIL / DEV_AUTH_PASSWORD not configured in .env" },
      { status: 503 }
    );
  }

  if (body.email !== devEmail || body.password !== devPassword) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Upsert dev user — identicky jako web Credentials provider (nemusí existovat předem)
  const user = await prisma.user.upsert({
    where: { email: devEmail },
    update: {},
    create: { email: devEmail, name: "Dev User" },
  });

  const sessionToken = await createMobileSessionToken(user.id);

  return Response.json({
    sessionToken,
    cookieName: MOBILE_COOKIE_NAME,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      companyId: user.companyId,
      role: user.role,
    },
  });
}
