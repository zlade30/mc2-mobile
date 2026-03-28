/**
 * Returns the customer route path for a notification based on its data payload.
 * Used when opening the app from a push or when tapping a notification in the list.
 */
export function getNotificationRoute(
  data: Record<string, unknown> | undefined | null,
): string {
  const type = typeof data?.type === "string" ? data.type : undefined;
  if (type === "reward" || type === "rewards") {
    return "/(customer)/(tabs)/rewards";
  }

  if (data?.promotion_id) {
    return `/(customer)/promo/${data.promotion_id}`;
  }

  return "/(customer)/(tabs)/promos";
}
