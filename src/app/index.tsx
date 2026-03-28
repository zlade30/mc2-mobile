import * as Linking from "expo-linking";
import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";

import { getDemoRole, isDemoUser, Role } from "@/features/auth";
import { useAuthStore } from "@/features/auth/zustand";
import { useBiometricStore } from "@/shared/store";
import { BiometricGate } from "@/shared/ui/biometric-gate";
import { useNotificationsStore } from "@/features/notifications";

const RESET_PASSWORD_PATH_REGEX =
  /^(?:mc2app|mc2loyalty):\/\/reset-password\/([^/?]+)(?:\?([^#]*))?/;

function parseResetPasswordLink(
  url: string,
): { token: string; email: string } | null {
  const match = url.match(RESET_PASSWORD_PATH_REGEX);
  if (!match) return null;
  const token = match[1];
  const query = match[2] ?? "";
  const emailMatch = query.match(/(?:^|&)email=([^&]+)/);
  const email = emailMatch
    ? decodeURIComponent(emailMatch[1].replace(/\+/g, " "))
    : "";
  if (!token || !email) return null;
  return { token, email };
}

export default function IndexScreen() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const biometricEnabled = useBiometricStore((state) => state.biometricEnabled);
  const unlockedThisSession = useBiometricStore(
    (state) => state.unlockedThisSession,
  );
  const setUnlockedThisSession = useBiometricStore(
    (state) => state.setUnlockedThisSession,
  );

  const pendingNotificationRoute = useNotificationsStore(
    (s) => s.pendingRoute,
  );
  const consumePendingNotificationRoute = useNotificationsStore(
    (s) => s.consumePendingRoute,
  );

  const [resetPasswordRedirect, setResetPasswordRedirect] = useState<{
    token: string;
    email: string;
  } | null>(null);
  const [initialUrlChecked, setInitialUrlChecked] = useState(false);

  useEffect(() => {
    if (token && user) {
      setInitialUrlChecked(true);
      return;
    }
    let cancelled = false;
    Linking.getInitialURL()
      .then((url) => {
        if (cancelled || !url) {
          setInitialUrlChecked(true);
          return;
        }
        const parsed = parseResetPasswordLink(url);
        if (parsed) setResetPasswordRedirect(parsed);
        setInitialUrlChecked(true);
      })
      .catch(() => setInitialUrlChecked(true));
    return () => {
      cancelled = true;
    };
  }, [token, user]);

  const showGate = biometricEnabled && !unlockedThisSession;

  // If a notification tap came in, navigate immediately after biometric unlock.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!token || !user) return;
    if (showGate) return;
    if (!pendingNotificationRoute) return;

    const route = consumePendingNotificationRoute();
    if (route) {
      router.replace(route as Parameters<typeof router.replace>[0]);
    }
  }, [
    consumePendingNotificationRoute,
    hasHydrated,
    pendingNotificationRoute,
    router,
    showGate,
    token,
    user,
  ]);

  if (!hasHydrated) {
    return null;
  }

  if (!token || !user) {
    if (!initialUrlChecked) return null;
    if (resetPasswordRedirect) {
      const { token: t, email: e } = resetPasswordRedirect;
      return (
        <Redirect
          href={`/(auth)/reset-password/${encodeURIComponent(t)}?email=${encodeURIComponent(e)}`}
        />
      );
    }
    return <Redirect href="/(auth)/login" />;
  }

  if (!showGate && pendingNotificationRoute) {
    // Let the effect trigger navigation; don't render any other redirect.
    return null;
  }

  if (showGate) {
    return (
      <BiometricGate
        onSuccess={() => {
          setUnlockedThisSession(true);
        }}
      />
    );
  }

  if (isDemoUser(user)) {
    const role = getDemoRole(user.email ?? "");
    return role === "staff" ? (
      <Redirect href="/(demo)/staff/(tabs)" />
    ) : (
      <Redirect href="/(demo)/customer/(tabs)" />
    );
  }

  const roles = user.roles || [];
  const isCustomer = roles.some((role: Role) => role.name === "customer");

  if (isCustomer) {
    return <Redirect href="/(customer)/(tabs)" />;
  }
  return <Redirect href="/(staff)/(tabs)" />;
}
