/**
 * Dashboard-specific types that extend the shared domain types
 * with runtime data not needed in the shared package.
 */

export interface DeskEntry {
  id: string;
  name: string;
  status: "available" | "booked";
  /** Display name of person who booked this desk */
  user?: string;
  /** User ID of who booked (used to detect "isOwn" in client) */
  userId?: string;
  /** Reservation ID — required for cancellation */
  reservationId?: string;
  duration?: string;
}
