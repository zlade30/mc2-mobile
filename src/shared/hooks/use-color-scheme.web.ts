import { useThemeStore } from "@/shared/store";

export function useColorScheme() {
  return useThemeStore((state) => state.colorScheme);
}
