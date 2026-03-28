import { Tabs } from "expo-router";
import React from "react";

import { CustomTabBarWithCenterCircle } from "@/shared/ui/custom-tab-bar";
import {
  Gift,
  HandShake,
  History,
  Home,
  QrCode,
} from "@solar-icons/react-native/Broken";
import { Platform } from "react-native";

export default function CustomerTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBarWithCenterCircle {...props} />}
      detachInactiveScreens={Platform.OS !== "ios"}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#ffffff" },
        animation: "shift",
        transitionSpec: {
          animation: "timing",
          config: {
            duration: 150,
          },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          href: null,
          title: "Rewards",
          tabBarIcon: ({ color }) => <Gift size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="promos"
        options={{
          title: "Offers",
          tabBarIcon: ({ color }) => <HandShake size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => <History size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <QrCode size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
