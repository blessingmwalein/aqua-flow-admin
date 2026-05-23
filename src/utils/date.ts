import {
  format,
  formatDistanceToNow,
  parseISO,
  isValid,
  startOfDay,
  endOfDay,
} from "date-fns";

export function formatDate(
  dateStr: string | Date,
  pattern = "MMM d, yyyy"
): string {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (!isValid(date)) return "—";
  return format(date, pattern);
}

export function formatDateTime(dateStr: string | Date): string {
  return formatDate(dateStr, "MMM d, yyyy h:mm a");
}

export function timeAgo(dateStr: string | Date): string {
  const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
  if (!isValid(date)) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function toISOStart(date: Date): string {
  return startOfDay(date).toISOString();
}

export function toISOEnd(date: Date): string {
  return endOfDay(date).toISOString();
}
