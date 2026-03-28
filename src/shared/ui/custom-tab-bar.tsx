import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styled, useTheme } from "styled-components/native";

import { useNotificationBadgeStore } from "@/shared/store";
import { IconSymbol } from "@/shared/ui/icon-symbol";

const TAB_BAR_HEIGHT = 64;
const FLOATING_MARGIN_H = 20;
const FLOATING_MARGIN_BOTTOM = 8;
const CENTER_INDEX = 2;
const HIDDEN_TAB_NAMES: string[] = [""];
const ICON_SIZE = 24;
const CENTER_ICON_SIZE = 26;
const ACCENT_LINE_HEIGHT = 3;
const ACCENT_LINE_WIDTH = 24;

const BarContainer = styled.View<{ $insetBottom: number }>`
  margin-horizontal: ${FLOATING_MARGIN_H}px;
  margin-bottom: ${(p) => p.$insetBottom}px;
  margin-top: 8px;
  min-height: ${TAB_BAR_HEIGHT}px;
  background-color: ${(p) => p.theme.colors.surface};
  border-radius: 999px;
  padding-horizontal: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  overflow: hidden;
  ${(p) =>
    Platform.OS === "ios"
      ? `
    shadow-color: ${p.theme.colors.brownDark};
    shadow-offset: 0px 6px;
    shadow-opacity: 0.1;
    shadow-radius: 12px;
  `
      : "elevation: 8;"}
`;

const Row = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-around;
`;

const TabItem = styled(Pressable)`
  flex: 1;
  margin-horizontal: 2px;
  align-items: center;
  justify-content: flex-end;
`;

const TabItemContent = styled.View`
  align-items: center;
  justify-content: center;
`;

const TabLabel = styled.Text<{ $color: string }>`
  font-size: 10px;
  font-family: ${(p) => p.theme.typography.fontFamily.semiBold};
  margin-top: 4px;
  color: ${(p) => p.$color};
`;

const AccentLine = styled.View<{
  $backgroundColor: string;
  $width?: number;
}>`
  height: ${ACCENT_LINE_HEIGHT}px;
  width: ${(p) => p.$width ?? ACCENT_LINE_WIDTH}px;
  border-radius: 2px;
  margin-top: 2px;
  background-color: ${(p) => p.$backgroundColor};
`;

const BadgeWrapper = styled.View`
  position: relative;
  align-items: center;
  justify-content: center;
`;

const Badge = styled.View`
  position: absolute;
  top: -4px;
  right: -8px;
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

function getBadgeCount(
  routeName: string,
  rewardsCount: number,
  promosCount: number,
): number {
  if (routeName === "rewards") return rewardsCount;
  if (routeName === "promos") return promosCount;
  return 0;
}

export function CustomTabBarWithCenterCircle({
  state,
  navigation,
  descriptors,
  insets: navInsets,
}: BottomTabBarProps) {
  const theme = useTheme();
  const safeInsets = useSafeAreaInsets();
  // Keep the bar inside the iOS safe-area (home indicator) but avoid an
  // extra "floating" gap that makes it look higher than Android.
  const bottomInsetBase = navInsets?.bottom ?? safeInsets.bottom;
  const bottomInset =
    bottomInsetBase + (Platform.OS === "android" ? FLOATING_MARGIN_BOTTOM : 0);
  const activeColor = theme.colors.tabIconSelected;
  const inactiveColor = theme.colors.tabIconDefault;

  const rewardsCount = useNotificationBadgeStore((s) => s.rewardsCount);
  const promosCount = useNotificationBadgeStore((s) => s.promosCount);
  const clearRewards = useNotificationBadgeStore((s) => s.clearRewards);
  const clearPromos = useNotificationBadgeStore((s) => s.clearPromos);

  return (
    <BarContainer $insetBottom={bottomInset}>
      <Row>
        {state.routes
          .filter((route) => !HIDDEN_TAB_NAMES.includes(route.name))
          .map((route, index) => {
            const focused = state.routes[state.index]?.key === route.key;
            const { options } = descriptors[route.key];
            const isCenter = index === CENTER_INDEX;
            const badgeCount = getBadgeCount(
              route.name,
              rewardsCount,
              promosCount,
            );

            const onPress = () => {
              if (route.name === "rewards") clearRewards();
              if (route.name === "promos") clearPromos();
              if (Platform.OS === "ios") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.dispatch({
                  ...CommonActions.navigate(route),
                  target: state.key,
                });
              }
            };

            const label =
              typeof options.tabBarLabel === "string"
                ? options.tabBarLabel
                : (options.title ?? route.name);
            const iconColor = focused ? activeColor : inactiveColor;
            const accentColor = activeColor;
            const iconSize = isCenter ? CENTER_ICON_SIZE : ICON_SIZE;

            const iconElement = (
              <>
                {options.tabBarIcon?.({
                  focused,
                  color: iconColor,
                  size: iconSize,
                }) ?? (
                  isCenter ? (
                    <IconSymbol
                      name="gift.fill"
                      size={iconSize}
                      color={iconColor}
                    />
                  ) : null
                )}
              </>
            );

            const tabIconWithBadge = (
              <TabItemContent>
                <BadgeWrapper>
                  {iconElement}
                  {badgeCount > 0 && (
                    <Badge>
                      <BadgeText>
                        {badgeCount > 99 ? "99+" : String(badgeCount)}
                      </BadgeText>
                    </Badge>
                  )}
                </BadgeWrapper>
              </TabItemContent>
            );

            if (isCenter) {
              return (
                <TabItem key={route.key} onPress={onPress}>
                  {tabIconWithBadge}
                  {typeof label === "string" && (
                    <TabLabel
                      $color={focused ? activeColor : inactiveColor}
                      numberOfLines={1}
                    >
                      {label}
                    </TabLabel>
                  )}
                  <AccentLine
                    $backgroundColor={focused ? accentColor : "transparent"}
                    $width={ACCENT_LINE_WIDTH + 12}
                  />
                </TabItem>
              );
            }

            return (
              <TabItem key={route.key} onPress={onPress}>
                {tabIconWithBadge}
                {typeof label === "string" && (
                  <TabLabel $color={iconColor} numberOfLines={1}>
                    {label}
                  </TabLabel>
                )}
                <AccentLine
                  $backgroundColor={focused ? accentColor : "transparent"}
                />
              </TabItem>
            );
          })}
      </Row>
    </BarContainer>
  );
}
