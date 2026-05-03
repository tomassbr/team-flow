import * as SecureStore from "expo-secure-store";
import { createTeamFlowClient } from "@team-flow/api-client";

/** SecureStore key for the NextAuth session token (raw JWT string). */
export const SESSION_TOKEN_KEY = "team_flow_session_token";

/**
 * The NextAuth cookie name the backend expects.
 * Mobile connects via HTTP (LAN/IP), so the non-secure prefix is always used.
 * The web uses __Secure- prefix over HTTPS — NextAuth handles that automatically.
 */
export const SESSION_COOKIE_NAME = "authjs.session-token";

export const api = createTeamFlowClient({
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",

  getHeaders: async (): Promise<Record<string, string>> => {
    const token = await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    if (token) return { Cookie: `${SESSION_COOKIE_NAME}=${token}` };
    return {};
  },
});
