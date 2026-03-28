import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const BIOMETRIC_STORAGE_KEY = "@mc2loyalty/biometric";

type BiometricStore = {
  biometricEnabled: boolean;
  unlockedThisSession: boolean;
  setBiometricEnabled: (enabled: boolean) => void;
  setUnlockedThisSession: (value: boolean) => void;
  toggleBiometric: () => void;
  /** Clears biometric/FaceID preference and session state (e.g. on logout). */
  resetForLogout: () => void;
};

export const useBiometricStore = create<BiometricStore>()(
  persist(
    (set) => ({
      biometricEnabled: false,
      unlockedThisSession: false,
      setBiometricEnabled: (enabled) => set({ biometricEnabled: enabled }),
      setUnlockedThisSession: (value) => set({ unlockedThisSession: value }),
      toggleBiometric: () =>
        set((state) => ({ biometricEnabled: !state.biometricEnabled })),
      resetForLogout: () =>
        set({ biometricEnabled: false, unlockedThisSession: false }),
    }),
    {
      name: BIOMETRIC_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ biometricEnabled: state.biometricEnabled }),
    },
  ),
);
