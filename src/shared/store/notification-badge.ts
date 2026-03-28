import { create } from "zustand";

export type NotificationTab = "rewards" | "promos" | "notifications";

type NotificationBadgeStore = {
  rewardsCount: number;
  promosCount: number;
  notificationsCount: number;
  incrementRewards: () => void;
  incrementPromos: () => void;
  incrementNotifications: () => void;
  clearRewards: () => void;
  clearPromos: () => void;
  clearNotifications: () => void;
  getCount: (tab: NotificationTab) => number;
};

export const useNotificationBadgeStore = create<NotificationBadgeStore>()(
  (set, get) => ({
    rewardsCount: 0,
    promosCount: 0,
    notificationsCount: 0,
    incrementRewards: () =>
      set((state) => ({ rewardsCount: state.rewardsCount + 1 })),
    incrementPromos: () =>
      set((state) => ({ promosCount: state.promosCount + 1 })),
    incrementNotifications: () =>
      set((state) => ({ notificationsCount: state.notificationsCount + 1 })),
    clearRewards: () => set({ rewardsCount: 0 }),
    clearPromos: () => set({ promosCount: 0 }),
    clearNotifications: () => set({ notificationsCount: 0 }),
    getCount: (tab) => {
      if (tab === "rewards") return get().rewardsCount;
      if (tab === "promos") return get().promosCount;
      if (tab === "notifications") return get().notificationsCount;
      return 0;
    },
  }),
);
