import * as AuthSession from "expo-auth-session";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { SESSION_TOKEN_KEY, SESSION_COOKIE_NAME } from "../../lib/apiClient";

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface MobileAuthResponse {
  sessionToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    companyId: string | null;
    role: "ADMIN" | "MEMBER";
  };
}

async function storeSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

/** Exchange a provider-issued token for a backend session token. */
async function exchangeForSession(
  endpoint: string,
  body: Record<string, unknown>
): Promise<MobileAuthResponse | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`[auth] ${endpoint} returned ${response.status}:`, text);
      return null;
    }
    return response.json();
  } catch (e) {
    console.error(`[auth] fetch ${endpoint} failed:`, e);
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

export const authService = {
  /**
   * Google Sign-In via PKCE OAuth flow.
   *
   * Flow:
   * 1. Opens Google in a system browser (expo-auth-session)
   * 2. User authenticates → redirected back with authorization code
   * 3. Mobile sends code + PKCE code_verifier to our backend
   * 4. Backend exchanges with Google → verifies user → returns NextAuth session token
   * 5. Token stored in SecureStore; sent as Cookie header on every API request
   *
   * Requires: EXPO_PUBLIC_GOOGLE_CLIENT_ID + GOOGLE_MOBILE_CLIENT_ID on backend
   */
  async signInWithGoogle(): Promise<boolean> {
    const googleDiscovery = await AuthSession.fetchDiscoveryAsync(
      "https://accounts.google.com"
    );

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: "teamflow",
      path: "auth/callback",
    });

    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["openid", "email", "profile"],
      redirectUri,
      usePKCE: true,
    });

    const result = await request.promptAsync(googleDiscovery);

    if (result.type !== "success") return false;

    const data = await exchangeForSession("/api/auth/mobile/google", {
      code: result.params.code,
      codeVerifier: request.codeVerifier,
      redirectUri,
    });

    if (!data) return false;
    await storeSessionToken(data.sessionToken);
    return true;
  },

  /**
   * Apple Sign-In — required by App Store Review Guidelines (4.8) when any
   * third-party social login is offered on iOS.
   *
   * Flow:
   * 1. Native Apple authentication sheet appears (expo-apple-authentication)
   * 2. User authenticates with Face ID / Touch ID / password
   * 3. Apple returns an identity token (signed JWT)
   * 4. Mobile sends identity token to our backend for verification
   * 5. Backend verifies token via Apple's public JWKS → creates session
   *
   * NOTE: Apple only provides the user's email on the FIRST sign-in.
   *       Subsequent logins only include the Apple user ID (sub).
   *
   * Requires: expo-apple-authentication installed, Sign in with Apple
   * capability enabled in Xcode, APPLE_APP_BUNDLE_ID on backend.
   */
  async signInWithApple(): Promise<boolean> {
    if (Platform.OS !== "ios") return false;

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (!credential.identityToken) return false;

    const data = await exchangeForSession("/api/auth/mobile/apple", {
      identityToken: credential.identityToken,
      fullName: credential.fullName,
    });

    if (!data) return false;
    await storeSessionToken(data.sessionToken);
    return true;
  },

  /** Dev credentials sign-in — only available in __DEV__ builds. */
  async signInWithCredentials(email: string, password: string): Promise<boolean> {
    const data = await exchangeForSession("/api/auth/mobile/dev", { email, password });
    if (!data) return false;
    await storeSessionToken(data.sessionToken);
    return true;
  },

  /**
   * Validuje uložený session token proti backendu a vrátí data uživatele.
   *
   * Volá /api/auth/mobile/session (vlastní endpoint) místo NextAuth interního
   * /api/auth/session — ten nemusí správně zpracovat ručně vytvořený JWT
   * při použití PrismaAdapter v database-session módu.
   */
  async getSession(): Promise<{
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    companyId: string | null;
    role: "ADMIN" | "MEMBER";
  } | null> {
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    if (!token) return null;

    // Authorization: Bearer místo Cookie — iOS NSHTTPCookieStorage může
    // modifikovat Cookie header a přidávat nepotřebné hodnoty.
    const response = await fetch(`${API_BASE_URL}/api/auth/mobile/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (!data?.user) return null;

    return {
      id: data.user.id,
      email: data.user.email,
      name: data.user.name ?? null,
      image: data.user.image ?? null,
      companyId: data.user.companyId ?? null,
      role: data.user.role ?? "MEMBER",
    };
  },

  async signOut(): Promise<void> {
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    if (token) {
      await fetch(`${API_BASE_URL}/api/auth/signout`, {
        method: "POST",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${token}` },
      }).catch(() => {
        // Ignore errors — clear local session regardless
      });
    }
    await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
  },
};
