import { Stack } from "expo-router";
import React from "react";

export default function DemoStaffLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="scan-reward" options={{ headerShown: false }} />
      <Stack.Screen name="reward-drinks" options={{ headerShown: false }} />
    </Stack>
  );
}
