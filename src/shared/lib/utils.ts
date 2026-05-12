import { AxiosError } from "axios";

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

/**
 * Extracts a user-friendly message from a caught error.
 * Handles AxiosError (response.data.message) and falls back to a default message.
 */
export function getErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_MESSAGE,
): string {
  const data =
    error instanceof AxiosError ? error.response?.data : null;
  const message =
    data && typeof data === "object" && "message" in data && typeof (data as { message?: unknown }).message === "string"
      ? (data as { message: string }).message
      : fallback;
  return message;
}

/**
 * Returns the current date formatted as "MONDAY, MARCH 9 2026".
 */
export function getFormattedDate(): string {
  const d = new Date();
  const weekday = d
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();
  const month = d.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const day = d.getDate();
  const year = d.getFullYear();
  return `${weekday}, ${month} ${day} ${year}`;
}

/**
 * Force-formats user input as YYYY-MM-DD. Strips non-digits, caps at 8 digits,
 * inserts hyphens after the year and month.
 */
export function formatBirthdayInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}
