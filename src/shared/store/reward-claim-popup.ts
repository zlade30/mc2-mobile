import { create } from "zustand";

type RewardClaimPopupPayload = {
  id: string;
  title: string;
  message: string;
};

type RewardClaimPopupState = {
  visible: boolean;
  payload: RewardClaimPopupPayload | null;
  showRewardClaimPopup: (payload: RewardClaimPopupPayload) => void;
  hideRewardClaimPopup: () => void;
};

export const useRewardClaimPopupStore = create<RewardClaimPopupState>((set) => ({
  visible: false,
  payload: null,
  showRewardClaimPopup: (payload) =>
    set((state) => {
      if (state.payload?.id === payload.id) {
        return state;
      }
      return {
        visible: true,
        payload,
      };
    }),
  hideRewardClaimPopup: () =>
    set({
      visible: false,
      payload: null,
    }),
}));
