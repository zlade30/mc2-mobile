import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { NotificationItem } from "./types";

const NOTIFICATIONS_STORAGE_KEY = "mc2loyalty-notifications";
const MAX_NOTIFICATIONS = 100;

type NotificationsState = {
  notifications: NotificationItem[];
  /**
   * Route to navigate to after the user finishes any auth/biometric gating.
   * Not persisted intentionally: we only want to handle the next notification tap.
   */
  pendingRoute: string | null;
  addNotification: (item: NotificationItem) => void;
  setPendingRoute: (route: string) => void;
  consumePendingRoute: () => string | null;
  clearAllNotifications: () => void;
};

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set) => ({
      notifications: [],
      pendingRoute: null,
      addNotification: (item) =>
        set((state) => {
          const deduped = state.notifications.filter(
            (notification) => notification.id !== item.id,
          );
          const next = [item, ...deduped].slice(0, MAX_NOTIFICATIONS);
          return { notifications: next };
        }),
      setPendingRoute: (route) => set({ pendingRoute: route }),
      consumePendingRoute: () => {
        let route: string | null = null;
        set((state) => {
          route = state.pendingRoute;
          return { pendingRoute: null };
        });
        return route;
      },
      clearAllNotifications: () => set({ notifications: [] }),
    }),
    {
      name: NOTIFICATIONS_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: NotificationsState) => ({
        notifications: state.notifications,
      }),
    },
  ),
);
