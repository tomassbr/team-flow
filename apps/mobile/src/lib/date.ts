import { format, isToday, isTomorrow, isThisWeek } from "date-fns";

/** Returns "YYYY-MM-DD" format for API calls */
export function toApiDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Returns a human-readable label for the date strip */
export function toDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date)) return format(date, "EEEE"); // "Monday"
  return format(date, "MMM d"); // "Jan 12"
}

/** Returns the short day abbreviation for the date strip header */
export function toDayAbbrev(date: Date): string {
  return format(date, "EEE"); // "Mon"
}

/** Returns "Mon 12" format */
export function toDayMonth(date: Date): string {
  return format(date, "EEE d");
}
