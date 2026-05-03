import type { Company } from "@team-flow/shared";
import type { ApiClient } from "./client";

export interface CompanyCreateResponse {
  company: Company;
  refreshSession: true;
}

export function createCompanyApi(client: ApiClient) {
  return {
    /** GET /api/company — fetch the current user's company */
    get: () => client.request<Company>("/api/company"),

    /**
     * POST /api/company — create a new company (onboarding).
     * Only for users who don't have a company yet.
     * Returns refreshSession: true — caller must re-fetch the session after this.
     */
    create: (name: string) =>
      client.request<CompanyCreateResponse>("/api/company", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),

    /**
     * PATCH /api/company — update company settings (ADMIN only).
     * primaryColor must be a hex string e.g. "#6366F1".
     */
    update: (fields: { name?: string; primaryColor?: string }) =>
      client.request<Company>("/api/company", {
        method: "PATCH",
        body: JSON.stringify(fields),
      }),
  };
}
