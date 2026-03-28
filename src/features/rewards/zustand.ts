import { create } from "zustand";

import type { CustomerRewards } from "@/features/rewards/types";

interface RewardsState {
  customerHashId: string;
  setCustomerHashId: (customerHashId: string) => void;
  reedemableRewards: CustomerRewards["redeemable"];
  isScanned: boolean;
  setReedemableRewards: (
    customerRewards: CustomerRewards["redeemable"],
  ) => void;
  setIsScanned: (isScanned: boolean) => void;
  reset: () => void;
}

const initialState = {
  customerHashId: "",
  reedemableRewards: [] as CustomerRewards["redeemable"],
  isScanned: false,
};

export const useRewardsStore = create<RewardsState>()((set) => ({
  ...initialState,
  setCustomerHashId: (customerHashId: string) => set({ customerHashId }),
  setReedemableRewards: (reedemableRewards: CustomerRewards["redeemable"]) =>
    set({ reedemableRewards }),
  setIsScanned: (isScanned: boolean) => set({ isScanned }),
  reset: () => set(initialState),
}));

export const rewardsStore = useRewardsStore;
