import { upsertProviderUser, createMobileSessionToken, MOBILE_COOKIE_NAME } from "../_session";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

/**
 * POST /api/auth/mobile/google
 *
 * Exchanges a Google OAuth authorization code (from expo-auth-session PKCE flow)
 * for a NextAuth-compatible session token.
 *
 * Body: { code, redirectUri, codeVerifier }
 * Response: { sessionToken, cookieName, user }
 *
 * The mobile client stores sessionToken in SecureStore and sends it as:
 *   Cookie: authjs.session-token=<sessionToken>
 *
 * This is decoded by NextAuth's auth() exactly as a web session — no API changes needed.
 *
 * Setup required:
 *  - Google Cloud Console: create an "iOS" OAuth 2.0 client (no client_secret for mobile PKCE)
 *  - Set GOOGLE_MOBILE_CLIENT_ID in .env.local
 *  - Register redirect URI: teamflow://auth/callback + Expo Go proxy URI
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.code || !body?.redirectUri || !body?.codeVerifier) {
    return Response.json(
      { error: "Missing required fields: code, redirectUri, codeVerifier" },
      { status: 400 }
    );
  }

  const clientId = process.env.GOOGLE_MOBILE_CLIENT_ID;
  if (!clientId) {
    return Response.json(
      { error: "GOOGLE_MOBILE_CLIENT_ID is not configured" },
      { status: 503 }
    );
  }

  // Exchange authorization code for tokens using PKCE (no client_secret for mobile clients)
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: body.code,
      client_id: clientId,
      redirect_uri: body.redirectUri,
      grant_type: "authorization_code",
      code_verifier: body.codeVerifier,
    }),
  });

  const tokens: GoogleTokenResponse = await tokenResponse.json();

  if (tokens.error || !tokens.access_token) {
    console.error("Google token exchange failed:", tokens.error_description);
    return Response.json(
      { error: "Google authentication failed" },
      { status: 401 }
    );
  }

  // Fetch user info using the access token
  const userInfoResponse = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );
  const userInfo: GoogleUserInfo = await userInfoResponse.json();

  if (!userInfo.sub) {
    return Response.json({ error: "Failed to retrieve Google user info" }, { status: 401 });
  }

  const user = await upsertProviderUser({
    provider: "google",
    providerAccountId: userInfo.sub,
    email: userInfo.email,
    name: userInfo.name ?? null,
    image: userInfo.picture ?? null,
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
