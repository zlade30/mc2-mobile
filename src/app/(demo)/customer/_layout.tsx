import { Stack } from "expo-router";
import React from "react";

export default function DemoCustomerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="rewards-history" options={{ headerShown: false }} />
      <Stack.Screen name="history-details" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="change-password" options={{ headerShown: false }} />
      <Stack.Screen name="delete-account" options={{ headerShown: false }} />
      <Stack.Screen name="promo/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="terms-of-service" options={{ headerShown: false }} />
      <Stack.Screen name="set-pin" options={{ headerShown: false }} />
    </Stack>
  );
}
