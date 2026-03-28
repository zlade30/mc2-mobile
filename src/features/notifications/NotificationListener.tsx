import {
  getInitialNotification,
  onNotificationOpenedApp,
  type RemoteMessage,
} from "@react-native-firebase/messaging";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { v4 as uuidv4 } from "uuid";

import { messaging } from "../../../firebase";

import { useBiometricStore } from "@/shared/store";
import { getNotificationRoute } from "./navigation";
import { useNotificationsStore } from "./store";
import type { NotificationItem } from "./types";

function buildNotificationItem(message: RemoteMessage): NotificationItem {
  const titleFromData =
    typeof message.data?.title === "string" ? message.data.title : undefined;
  const bodyFromData =
    typeof message.data?.body === "string" ? message.data.body : undefined;

  return {
    id: message.messageId ?? uuidv4(),
    title: message.notification?.title ?? titleFromData ?? "Notification",
    body: message.notification?.body ?? bodyFromData ?? "",
    data:
      message.data && typeof message.data === "object"
        ? (message.data as Record<string, unknown>)
        : undefined,
    createdAt: new Date().toISOString(),
  };
}

export default function NotificationListener() {
  const router = useRouter();
  const setPendingRoute = useNotificationsStore((s) => s.setPendingRoute);
  const addNotification = useNotificationsStore((s) => s.addNotification);

  useEffect(() => {
    let isActive = true;

    if (Platform.OS === "web") {
      return;
    }

    const unsubscribeOpened = onNotificationOpenedApp(
      messaging,
      (remoteMessage: RemoteMessage) => {
        addNotification(buildNotificationItem(remoteMessage));
        const route = getNotificationRoute(
          (remoteMessage.data ?? undefined) as
            | Record<string, unknown>
            | undefined,
        );
        const { biometricEnabled, unlockedThisSession } =
          useBiometricStore.getState();
        if (biometricEnabled && !unlockedThisSession) {
          // Wait until the biometric gate is satisfied (handled by `src/app/index.tsx`).
          setPendingRoute(route);
          // Biometric gate is only shown on the root `index` route; ensure it mounts.
          router.replace("/");
        } else {
          // App is already running; navigate immediately.
          router.replace(route as Parameters<typeof router.replace>[0]);
        }
      },
    );

    (async () => {
      const initialNotification = await getInitialNotification(messaging);
      if (!isActive || !initialNotification) {
        return;
      }

      addNotification(buildNotificationItem(initialNotification));
      const route = getNotificationRoute(
        (initialNotification.data ?? undefined) as
          | Record<string, unknown>
          | undefined,
      );
      const { biometricEnabled, unlockedThisSession } =
        useBiometricStore.getState();
      if (biometricEnabled && !unlockedThisSession) {
        setPendingRoute(route);
        // Ensure root index route is mounted so biometric gate is shown.
        router.replace("/");
      } else {
        router.replace(route as Parameters<typeof router.replace>[0]);
      }
    })().catch((error: unknown) => {
      console.warn("Failed to process initial notification", error);
    });

    return () => {
      isActive = false;
      unsubscribeOpened();
    };
  }, [addNotification, router, setPendingRoute]);

  return null;
}
