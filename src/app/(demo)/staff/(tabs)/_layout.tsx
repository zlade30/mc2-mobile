import { Gift, User } from "@solar-icons/react-native/Broken";
import { Tabs } from "expo-router";
import React from "react";

import { CustomTabBarWithCenterCircle } from "@/shared/ui/custom-tab-bar";

export default function DemoStaffTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBarWithCenterCircle {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "#ffffff" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color }) => <Gift size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
