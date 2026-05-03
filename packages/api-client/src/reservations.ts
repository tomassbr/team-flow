import type { Desk, Reservation, ReservationWithUser } from "@team-flow/shared";
import type { ApiClient } from "./client";

export interface ReservationsListResponse {
  reservations: ReservationWithUser[];
  desks: Desk[];
}

export function createReservationsApi(client: ApiClient) {
  return {
    /**
     * GET /api/reservations?date=YYYY-MM-DD
     * Returns all reservations for a given date plus the desk list.
     */
    list: (date: string) =>
      client.request<ReservationsListResponse>(
        `/api/reservations?date=${date}`
      ),

    /**
     * POST /api/reservations
     * Book a desk for a date. Throws ApiError(409) if already booked.
     */
    create: (body: { deskId: string; date: string }) =>
      client.request<Reservation>("/api/reservations", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    /**
     * DELETE /api/reservations?id=UUID
     * Cancel a reservation. Only the owner can cancel their own reservation.
     */
    cancel: (id: string) =>
      client.request<void>(`/api/reservations?id=${id}`, {
        method: "DELETE",
      }),
  };
}
