import { getCustomerProfile } from "@/features/profile";
import { useRewardsStore } from "@/features/rewards/zustand";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";
import {
  Platform,
  RefreshControl,
  ScrollView,
  type ScrollViewProps,
} from "react-native";

/** accentYellow – visible in light and dark. */
const REFRESH_TINT = "#B89B4A";

/** ScrollView that automatically uses pull-to-refresh from RefreshProvider when available. */
export function ScrollViewWithRefresh({
  refreshTintColor: _refreshTintColor,
  onRefresh,
  skipDefaultRefresh,
  ...scrollViewProps
}: ScrollViewProps & {
  /** Optional; spinner uses accentYellow (visible in dark mode) when omitted. */
  refreshTintColor?: string;
  onRefresh?: () => Promise<void>;
  /** When true, only run onRefresh (do not fetch customer profile). Use for staff screens. */
  skipDefaultRefresh?: boolean;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [tint, setTint] = useState("#fff");
  const { setIsScanned } = useRewardsStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const id = setTimeout(() => setTint(REFRESH_TINT), 150);
    return () => clearTimeout(id);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (!skipDefaultRefresh) {
        await queryClient.fetchQuery({
          queryKey: ["customerProfile"],
          queryFn: () => getCustomerProfile(),
        });
        setIsScanned(false);
      }
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, skipDefaultRefresh, queryClient, setIsScanned]);

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={tint}
          colors={[tint]}
          progressBackgroundColor={
            Platform.OS === "android" ? "transparent" : undefined
          }
        />
      }
    />
  );
}
