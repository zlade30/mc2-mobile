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
