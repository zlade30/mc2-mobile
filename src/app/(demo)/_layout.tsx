import { Stack } from "expo-router";
import React from "react";

export default function DemoLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="customer" options={{ headerShown: false }} />
      <Stack.Screen name="staff" options={{ headerShown: false }} />
    </Stack>
  );
}
