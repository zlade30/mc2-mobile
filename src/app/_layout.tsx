import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/nunito";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import { AppState, Platform } from "react-native";
import "react-native-reanimated";
import { ThemeProvider } from "styled-components/native";

import NotificationListener from "@/features/notifications/NotificationListener";
import {
  useBiometricStore,
  useThemeForStyled,
  useThemeStore,
} from "@/shared/store";
import type { AppTheme } from "@/shared/theme";
import { Colors } from "@/shared/theme";
import { ErrorBoundary } from "@/shared/ui/error-boundary";
import { OfflineGate } from "@/shared/ui/offline-gate";

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
const sentryEnvironment =
  process.env.EXPO_PUBLIC_SENTRY_ENVIRONMENT ??
  (__DEV__ ? "development" : "production");
const sentryRelease =
  process.env.EXPO_PUBLIC_SENTRY_RELEASE ??
  `mc2app@${Constants.expoConfig?.version ?? "unknown"}`;

if (sentryDsn != null && sentryDsn !== "") {
  Sentry.init({
    dsn: sentryDsn,
    enableNative: true,
    environment: sentryEnvironment,
    release: sentryRelease,
    debug: __DEV__,
  });

  if (__DEV__ || sentryEnvironment !== "production") {
    Sentry.addBreadcrumb({
      category: "sentry.init",
      message: "Sentry SDK initialized",
      level: "info",
      data: {
        environment: sentryEnvironment,
        release: sentryRelease,
        hasDsn: true,
      },
    });

    console.log("[Sentry] initialized", {
      environment: sentryEnvironment,
      release: sentryRelease,
    });
  }
}

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "index",
};

const queryClient = new QueryClient();

const AppLightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.primary,
  },
};

const AppDarkTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.primary,
  },
};

function RootLayoutContent() {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const theme = useThemeForStyled();
  const navTheme = colorScheme === "dark" ? AppDarkTheme : AppLightTheme;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background") {
        useBiometricStore.getState().setUnlockedThisSession(false);
      }
      if (nextState === "active" && Platform.OS !== "web") {
        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP,
        ).catch(() => {});
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <ThemeProvider theme={theme as AppTheme}>
      <ErrorBoundary>
        <NavigationThemeProvider value={navTheme}>
          <OfflineGate>
            <NotificationListener />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(demo)" options={{ headerShown: false }} />
              <Stack.Screen
                name="(customer)"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="(staff)" options={{ headerShown: false }} />
            </Stack>
          </OfflineGate>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </NavigationThemeProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (Platform.OS === "web") return;
    const lock = () => {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      ).catch(() => {});
    };
    lock();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutContent />
    </QueryClientProvider>
  );
}
