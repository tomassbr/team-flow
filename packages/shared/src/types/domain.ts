/**
 * Shared domain types — single source of truth for web AND mobile.
 * Keep in sync with prisma/schema.prisma.
 *
 * WHY HERE: Both apps/web and apps/mobile import from this package so
 * changes to types are caught at compile time in both apps simultaneously.
 * This is the core benefit of a monorepo for a full-stack + mobile product.
 */

export type Plan = "FREE" | "PRO";

export interface Company {
  id: string;
  name: string;
  plan: Plan;
  primaryColor: string | null;
}

export interface Desk {
  id: string;
  name: string;
  isActive: boolean;
  qrToken: string | null;
}

export interface UserSummary {
  id: string;
  name: string | null;
  image?: string | null;
}

export type DeskStatus = "available" | "booked";

export interface DeskWithStatus {
  id: string;
  name: string;
  status: DeskStatus;
  /** Name of the user who has a reservation, if status === "booked" */
  user?: string;
  duration?: string;
}

/** Shape of a reservation as returned by GET /api/reservations */
export interface Reservation {
  id: string;
  deskId: string;
  userId: string;
  date: string; // ISO date string "YYYY-MM-DD"
  status: "RESERVED" | "CONFIRMED" | "RELEASED";
  checkInAt: string | null;
  createdAt: string;
}

/** Reservation enriched with user data (returned by GET /api/reservations) */
export interface ReservationWithUser extends Reservation {
  user: UserSummary;
}

export type UserRole = "ADMIN" | "MEMBER";
