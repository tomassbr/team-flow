const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse and sanitise a name field.
 * Returns the trimmed string or null if empty / too long.
 */
export function parseName(
  value: unknown,
  maxLength = 100
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
}

/**
 * Parse an ISO date string (YYYY-MM-DD) into a Date (UTC midnight).
 * Returns null for any invalid input.
 */
export function parseDateString(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  if (!DATE_RE.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Returns true if date is today or in the future (UTC comparison).
 */
export function isFutureOrToday(date: Date): boolean {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return date.getTime() >= today.getTime();
}

/**
 * Validate a UUID string (v4 shape).
 * Returns the value unchanged or null if invalid.
 */
export function parseUUID(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return UUID_RE.test(value) ? value : null;
}

/**
 * Normalise a date to UTC midnight.
 */
export function toUtcMidnight(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}
