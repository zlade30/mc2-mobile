import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const POPUP_PROMO_STORAGE_KEY = "mc2loyalty-popup-promo";

interface PopupPromoState {
  dontShowPopupPromo: boolean;
  lastShownPopupPromoId: string | null;
  setDontShowPopupPromo: (value: boolean) => void;
  setLastShownPopupPromoId: (id: string | null) => void;
}

export const usePopupPromoStore = create<PopupPromoState>()(
  persist(
    (set) => ({
      dontShowPopupPromo: false,
      lastShownPopupPromoId: null,
      setDontShowPopupPromo: (value) => set({ dontShowPopupPromo: value }),
      setLastShownPopupPromoId: (id) => set({ lastShownPopupPromoId: id }),
    }),
    {
      name: POPUP_PROMO_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: PopupPromoState) => ({
        dontShowPopupPromo: state.dontShowPopupPromo,
        lastShownPopupPromoId: state.lastShownPopupPromoId,
      }),
    },
  ),
);
