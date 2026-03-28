import { getCustomerProfile } from "@/features/profile";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";

/**
 * Runs the given callback when the app returns to the foreground (user reopens
 * the app after minimizing or switching away).
 *
 * On React Native, TanStack Query's refetchOnWindowFocus does not fire for
 * minimize/reopen; use this hook to refetch when the app becomes active.
 */
export function useRefetchOnAppFocus(refetch: () => void | Promise<void>) {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const queryClient = useQueryClient();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        const becameActive =
          appState.current.match(/inactive|background/) &&
          nextState === "active";
        appState.current = nextState;
        if (becameActive) {
          await queryClient.fetchQuery({
            queryKey: ["customerProfile"],
            queryFn: () => getCustomerProfile(),
          });
          void refetch();
        }
      },
    );
    return () => subscription.remove();
  }, [refetch, queryClient]);
}
