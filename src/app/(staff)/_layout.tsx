import { Stack } from "expo-router";
import React from "react";

export default function StaffLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scan-reward" options={{ headerShown: false }} />
      <Stack.Screen name="reward-drinks" options={{ headerShown: false }} />
      <Stack.Screen
        name="change-password"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="delete-account" options={{ headerShown: false }} />
      <Stack.Screen name="set-pin" options={{ headerShown: false }} />
    </Stack>
  );
}
