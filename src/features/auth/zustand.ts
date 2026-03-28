import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { User } from "@/features/auth/types";
import { clearPin } from "@/shared/lib/pin";
import { useBiometricStore } from "@/shared/store/biometric";

const AUTH_STORAGE_KEY = "mc2loyalty-auth";

interface AuthState {
  token: string | null;
  fcmToken: string | null;
  user: User | null;
  _hasHydrated: boolean;
  setAuth: (token: string | null, user: User | null) => void;
  setFcmToken: (fcmToken: string | null) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      fcmToken: null,
      user: null,
      _hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      setFcmToken: (fcmToken) => set({ fcmToken }),
      setUser: (user) => set({ user }),
      clearAuth: () => {
        clearPin();
        useBiometricStore.getState().resetForLogout();
        set({ token: null, user: null, fcmToken: null });
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthState) => ({
        token: state.token,
        user: state.user,
        fcmToken: state.fcmToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export const authStore = useAuthStore;
