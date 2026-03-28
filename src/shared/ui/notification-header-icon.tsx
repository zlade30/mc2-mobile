import { useNotificationBadgeStore } from "@/shared/store";
import { Bell } from "@solar-icons/react-native/Broken";
import * as Haptics from "expo-haptics";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styled, useTheme } from "styled-components/native";

const Wrapper = styled(Pressable)<{ $top: number; $right: number }>`
  position: absolute;
  top: ${(p) => p.$top}px;
  right: ${(p) => p.$right}px;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const InlineWrapper = styled(Pressable)`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
`;

const BadgeWrapper = styled.View`
  position: relative;
  align-items: center;
  justify-content: center;
`;

const Badge = styled.View`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  padding-horizontal: 4px;
  border-radius: 8px;
  background-color: ${(p) => p.theme.colors.primary};
  align-items: center;
  justify-content: center;
`;

const BadgeText = styled.Text`
  font-size: 10px;
  font-family: ${(p) => p.theme.typography.fontFamily.bold};
  color: ${(p) => p.theme.colors.primaryForeground};
`;

export type NotificationHeaderIconProps = {
  /** When true, icon is not absolutely positioned and scrolls with content. Use inside screen headers. */
  inline?: boolean;
};

export function NotificationHeaderIcon({ inline = false }: NotificationHeaderIconProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const notificationsCount = useNotificationBadgeStore(
    (s) => s.notificationsCount,
  );

  const isNotificationsScreen = pathname === "/notifications";
  if (isNotificationsScreen) {
    return null;
  }

  const onPress = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/notifications");
  };

  const iconContent = (
    <BadgeWrapper>
      <Bell size={24} color={theme.colors.screenIcon} />
      {notificationsCount > 0 && (
        <Badge>
          <BadgeText>
            {notificationsCount > 99 ? "99+" : String(notificationsCount)}
          </BadgeText>
        </Badge>
      )}
    </BadgeWrapper>
  );

  if (inline) {
    return (
      <InlineWrapper onPress={onPress}>{iconContent}</InlineWrapper>
    );
  }

  const isHomeScreen = pathname === "/" || pathname === "/(tabs)";
  const top = insets.top + 8 + (isHomeScreen ? 10 : 0);
  const right = Math.max(insets.right, 16);

  return (
    <Wrapper $top={top} $right={right} onPress={onPress}>
      {iconContent}
    </Wrapper>
  );
}
