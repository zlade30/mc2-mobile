import { useThemeStore } from "@/shared/store";

/**
 * Returns the current color scheme (light/dark) from the theme store.
 * Use this so UI reacts to the user's theme preference.
 */
export function useColorScheme() {
  return useThemeStore((state) => state.colorScheme);
}
