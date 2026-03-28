import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { useCallback } from "react";

/**
 * Runs the given callback only when the user taps this tab while it's already
 * focused (not when the screen first gains focus). Use this to refetch data
 * when the user explicitly taps the tab, avoiding duplicate fetches with
 * useSuspenseQueries/initial load and useRefetchOnAppFocus.
 */
export function useRefreshOnTabPress(refresh: () => void | Promise<void>) {
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = (
        navigation as {
          addListener: (
            event: string,
            cb: (e: { target: string }) => void,
          ) => () => void;
        }
      ).addListener("tabPress", (e) => {
        const state = navigation.getState();
        if (!state?.routes?.length) return;
        const currentRoute = state.routes[state.index];
        if (currentRoute && e.target === currentRoute.key) {
          refresh();
        }
      });
      return unsubscribe;
    }, [navigation, refresh]),
  );
}
