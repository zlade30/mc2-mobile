import { Stack } from "expo-router";
import React from "react";

import { useThemeColor } from "@/shared/hooks/use-theme-color";

export default function AuthLayout() {
  const headerBg = useThemeColor({}, "background");
  const headerTint = useThemeColor({}, "text");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: headerBg },
        headerTintColor: headerTint,
        headerTitleStyle: { fontWeight: "600", fontSize: 18 },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Sign in" }} />
      <Stack.Screen name="register" options={{ title: "Create account" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Forgot password" }} />
      <Stack.Screen
        name="reset-password/[token]"
        options={{ title: "Reset password" }}
      />
    </Stack>
  );
}
