/**
 * @team-flow/api-client — typed HTTP client for the Team Flow REST API.
 *
 * USAGE (mobile):
 *   import * as SecureStore from 'expo-secure-store';
 *   import { createTeamFlowClient } from '@team-flow/api-client';
 *
 *   const api = createTeamFlowClient({
 *     baseUrl: process.env.EXPO_PUBLIC_API_URL!,
 *     getHeaders: async () => {
 *       const cookie = await SecureStore.getItemAsync('session');
 *       return cookie ? { Cookie: cookie } : {};
 *     },
 *   });
 *
 *   const desks = await api.desks.list();
 *
 * USAGE (web — browser handles cookies automatically):
 *   const api = createTeamFlowClient({ baseUrl: '' });
 *   const desks = await api.desks.list();
 */
export { createApiClient } from "./client";
export { ApiError } from "./errors";
export type { ClientConfig } from "./client";
export type { ReservationsListResponse } from "./reservations";
export type { CompanyCreateResponse } from "./company";

import { createApiClient } from "./client";
import { createDesksApi } from "./desks";
import { createReservationsApi } from "./reservations";
import { createCompanyApi } from "./company";
import type { ClientConfig } from "./client";

/** Creates a fully typed API client with all resource namespaces. */
export function createTeamFlowClient(config: ClientConfig) {
  const client = createApiClient(config);
  return {
    desks: createDesksApi(client),
    reservations: createReservationsApi(client),
    company: createCompanyApi(client),
  };
}

export type TeamFlowClient = ReturnType<typeof createTeamFlowClient>;
