import { registerDevice } from "@/features/auth";
import { useAuthStore } from "@/features/auth/zustand";
import { PopupPromotionGate } from "@/features/home";
import {
  useNotificationsStore,
  type NotificationItem,
} from "@/features/notifications";
import { getCustomerProfile } from "@/features/profile";
import { RewardClaimedPopup } from "@/features/rewards";
import { requestNotificationPermission } from "@/shared/lib/permission";
import { getErrorMessage } from "@/shared/lib/utils";
import {
  useNotificationBadgeStore,
  useRewardClaimPopupStore,
} from "@/shared/store";
import {
  getToken,
  onMessage,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { styled } from "styled-components/native";
import { v4 as uuidv4 } from "uuid";
import { messaging } from "../../../firebase";

const LayoutWrapper = styled.View`
  flex: 1;
`;

function buildNotificationItemFromMessage(payload: {
  notification?: { title?: string; body?: string } | null;
  data?: Record<string, unknown> | null;
  messageId?: string | null;
}): NotificationItem {
  const id = (payload.messageId as string | undefined) ?? uuidv4();
  const title =
    (payload.notification?.title as string | undefined) ?? "Notification";
  const body = (payload.notification?.body as string | undefined) ?? "";
  const data =
    payload.data && typeof payload.data === "object"
      ? (payload.data as Record<string, unknown>)
      : undefined;
  return {
    id,
    title,
    body,
    data,
    createdAt: new Date().toISOString(),
  };
}

function appendNotificationAndIncrementBadge(payload: {
  notification?: { title?: string; body?: string } | null;
  data?: Record<string, unknown> | null;
  messageId?: string | null;
}) {
  const item = buildNotificationItemFromMessage(payload);
  useNotificationsStore.getState().addNotification(item);
  useNotificationBadgeStore.getState().incrementNotifications();
}

function maybeShowRewardClaimPopup(payload: {
  notification?: { title?: string; body?: string } | null;
  messageId?: string | null;
}) {
  const title = (payload.notification?.title ?? "").trim();
  const body = (payload.notification?.body ?? "").trim();
  // Match the notification title case-insensitively.
  // Examples: "Reward Claimed", "reward claimed", "Reward-Claimed".
  const isRewardClaimed = /rewards?[\s_-]*claim(?:ed)?/i.test(title);
  if (!isRewardClaimed) {
    return;
  }

  useRewardClaimPopupStore.getState().showRewardClaimPopup({
    id: payload.messageId ?? `${title}-${body}`,
    title: title || "Reward Claimed",
    message: body || "Your reward has been successfully claimed.",
  });
}

function isRewardClaimedTitle(notificationTitle: string): boolean {
  return /rewards?[\s_-]*claim(?:ed)?/i.test(notificationTitle.trim());
}

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  appendNotificationAndIncrementBadge({
    notification: remoteMessage.notification as
      | { title?: string; body?: string }
      | undefined,
    data: remoteMessage.data as Record<string, unknown> | undefined,
    messageId: remoteMessage.messageId,
  });
});

export default function CustomerLayout() {
  const { setFcmToken } = useAuthStore();
  const queryClient = useQueryClient();

  const registerDeviceMutation = useMutation({
    mutationFn: registerDevice,
    onError: (error) => {
      console.error(getErrorMessage(error));
    },
  });

  useEffect(() => {
    const setupMessaging = async () => {
      try {
        const permissionGranted = await requestNotificationPermission();

        if (!permissionGranted) {
          return () => {};
        }

        const token = await getToken(messaging);
        console.log("token", token);
        await registerDeviceMutation.mutateAsync({
          fcm_token: token,
          platform: Platform.OS === "ios" ? "ios" : "android",
        });
        setFcmToken(token);

        const unsubscribe = onMessage(messaging, (payload) => {
          appendNotificationAndIncrementBadge({
            notification: payload.notification as
              | { title?: string; body?: string }
              | undefined,
            data: payload.data as Record<string, unknown> | undefined,
            messageId: payload.messageId,
          });
          maybeShowRewardClaimPopup({
            notification: payload.notification as
              | { title?: string; body?: string }
              | undefined,
            messageId: payload.messageId,
          });
          const type = (payload.data as { type?: string } | undefined)?.type;
          const notificationTitle =
            (payload.notification as { title?: string } | undefined)?.title ??
            "";
          if (type === "promotion") {
            useNotificationBadgeStore.getState().incrementPromos();
          } else if (type === "reward" || type === "rewards") {
            const isRewardClaimed = isRewardClaimedTitle(notificationTitle);
            if (!isRewardClaimed) {
              useNotificationBadgeStore.getState().incrementRewards();
            }
            // Force immediate refetch so UI updates while user is on screen
            queryClient.refetchQueries({ queryKey: ["promos"] });
            queryClient.refetchQueries({ queryKey: ["customer-rewards"] });
            // Profile UI reads from auth store; fetch runs getCustomerProfile which updates it
            queryClient.fetchQuery({
              queryKey: ["customerProfile"],
              queryFn: getCustomerProfile,
            });
          }
        });

        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error(
          "Error setting up Firebase messaging:",
          getErrorMessage(error),
        );
        return () => {};
      }
    };

    let cleanup: (() => void) | undefined;
    setupMessaging().then((fn) => {
      cleanup = fn;
    });
    return () => {
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for FCM setup
  }, []);

  return (
    <>
      <LayoutWrapper>
        <Stack
          screenOptions={{
            headerShown: false,
            animationDuration: 150,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="rewards-history"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="history-details"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="notifications" options={{ headerShown: false }} />
          <Stack.Screen
            name="change-password"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="delete-account"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="help-center" options={{ headerShown: false }} />
          <Stack.Screen name="set-pin" options={{ headerShown: false }} />
        </Stack>
      </LayoutWrapper>
      <PopupPromotionGate />
      <RewardClaimedPopup />
    </>
  );
}
