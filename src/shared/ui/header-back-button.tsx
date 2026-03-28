import { usePathname, useRouter } from "expo-router";
import type { Href } from "expo-router";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import { TouchableOpacity } from "react-native";
import { styled, useTheme } from "styled-components/native";

import { ArrowLeft } from "@solar-icons/react-native/Broken";

const HitSlop = { top: 12, bottom: 12, left: 12, right: 12 };

const Wrap = styled(TouchableOpacity)<{ $bg?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.md};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

export type HeaderBackButtonProps = {
  onPress?: (e: GestureResponderEvent) => void;
  backgroundColor?: string;
  iconColor?: string;
  promoDetailFallbackRoute?: Href;
};

export function HeaderBackButton({
  onPress,
  backgroundColor,
  iconColor,
  promoDetailFallbackRoute,
}: HeaderBackButtonProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isPromoDetailRoute = /\/promo\/[^/]+$/.test(pathname);
  const inferredHomeRoute = pathname.startsWith("/(demo)/customer")
    ? "/(demo)/customer/(tabs)/promos"
    : "/(customer)/(tabs)/promos";
  const homeRoute = promoDetailFallbackRoute ?? inferredHomeRoute;
  const handlePress =
    onPress ??
    (() => {
      if (isPromoDetailRoute) {
        router.replace(homeRoute);
        return;
      }
      router.back();
    });
  const bg = backgroundColor ?? theme.colors.surfaceElevated;
  const icon = iconColor ?? theme.colors.screenIcon;
  return (
    <Wrap onPress={handlePress} hitSlop={HitSlop} $bg={bg}>
      <ArrowLeft size={24} color={icon} />
    </Wrap>
  );
}
