import type { Desk } from "@team-flow/shared";
import type { ApiClient } from "./client";

export function createDesksApi(client: ApiClient) {
  return {
    /** GET /api/desks — list all active desks for the company */
    list: () => client.request<Desk[]>("/api/desks"),

    /** POST /api/desks — create a new desk (ADMIN only) */
    create: (name: string) =>
      client.request<Desk>("/api/desks", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),

    /** PATCH /api/desks/:id — update name or isActive (ADMIN only) */
    update: (id: string, fields: { name?: string; isActive?: boolean }) =>
      client.request<Desk>(`/api/desks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(fields),
      }),

    /** DELETE /api/desks/:id — delete desk and all its reservations (ADMIN only) */
    delete: (id: string) =>
      client.request<void>(`/api/desks/${id}`, { method: "DELETE" }),
  };
}
