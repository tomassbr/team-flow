/**
 * Re-export shared domain types from @team-flow/shared.
 *
 * WHY: The web app historically imported from 'types/domain'. Instead of
 * updating every import, we re-export from the shared package here.
 * New code (and mobile) should import directly from '@team-flow/shared'.
 */
export type {
  Plan,
  Company,
  Desk,
  UserSummary,
  DeskStatus,
  DeskWithStatus,
  Reservation,
  ReservationWithUser,
  UserRole,
} from "@team-flow/shared";
