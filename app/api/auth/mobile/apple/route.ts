import { createRemoteJWKSet, jwtVerify } from "jose";
import { upsertProviderUser, createMobileSessionToken, MOBILE_COOKIE_NAME } from "../_session";

interface AppleIdentityTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  is_private_email?: boolean | string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  nonce?: string;
  nonce_supported?: boolean;
  real_user_status?: number;
}

const APPLE_JWKS = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

/**
 * POST /api/auth/mobile/apple
 *
 * Verifies an Apple Sign-In identity token and issues a NextAuth-compatible session.
 *
 * Body: { identityToken, fullName?, nonce? }
 *   identityToken — JWT from expo-apple-authentication
 *   fullName      — only provided on first sign-in by Apple
 *   nonce         — optional PKCE nonce for replay protection
 *
 * Response: { sessionToken, cookieName, user }
 *
 * Apple guidelines:
 *  - identityToken is a signed JWT from Apple (public keys at appleid.apple.com/auth/keys)
 *  - `email` is only included on first sign-in; subsequent logins only have `sub`
 *  - `sub` is stable and unique per app — use it as the providerAccountId
 *
 * Setup required:
 *  - Apple Developer: enable Sign in with Apple capability for the app
 *  - Set APPLE_APP_BUNDLE_ID in .env.local (e.g. com.yourcompany.teamflow)
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.identityToken) {
    return Response.json({ error: "Missing identityToken" }, { status: 400 });
  }

  const bundleId = process.env.APPLE_APP_BUNDLE_ID;
  if (!bundleId) {
    return Response.json(
      { error: "APPLE_APP_BUNDLE_ID is not configured" },
      { status: 503 }
    );
  }

  // Verify Apple's JWT using their published public keys
  let payload: AppleIdentityTokenPayload;
  try {
    const { payload: verified } = await jwtVerify(body.identityToken, APPLE_JWKS, {
      issuer: "https://appleid.apple.com",
      audience: bundleId,
    });
    payload = verified as AppleIdentityTokenPayload;
  } catch (err) {
    console.error("Apple identity token verification failed:", err);
    return Response.json({ error: "Invalid Apple identity token" }, { status: 401 });
  }

  const appleUserId = payload.sub;
  const email = payload.email ?? null;

  // Apple only sends fullName on first sign-in
  const fullName = body.fullName
    ? `${body.fullName.givenName ?? ""} ${body.fullName.familyName ?? ""}`.trim() || null
    : null;

  const user = await upsertProviderUser({
    provider: "apple",
    providerAccountId: appleUserId,
    email,
    name: fullName,
    image: null,
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
