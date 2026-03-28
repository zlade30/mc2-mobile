import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { darkTheme, lightTheme } from "@/shared/theme";

const THEME_STORAGE_KEY = "@mc2loyalty/color-scheme";

export type ColorScheme = "light" | "dark";

type ThemeStore = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      colorScheme: "light",
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
      toggleTheme: () =>
        set((state) => ({
          colorScheme: state.colorScheme === "dark" ? "light" : "dark",
        })),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ colorScheme: state.colorScheme }),
    },
  ),
);

/** Selector: current theme object for styled-components ThemeProvider */
export function useThemeForStyled() {
  return useThemeStore((state) =>
    state.colorScheme === "dark" ? darkTheme : lightTheme,
  );
}

export const themeStore = useThemeStore;
