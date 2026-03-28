import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styled, useTheme } from "styled-components/native";

import { ThemedText } from "@/shared/ui/themed-text";

const Bar = styled.View<{ $insetTop: number }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${(p) => p.theme.spacing.sm};
  padding-top: ${(p) => p.$insetTop + 8}px;
  padding-bottom: ${(p) => p.theme.spacing.sm};
  padding-horizontal: ${(p) => p.theme.spacing.md};
  background-color: ${(p) => p.theme.colors.error};
`;

const BarText = styled(ThemedText)`
  color: ${(p) => p.theme.colors.primaryFg};
  font-size: 14px;
  font-weight: 600;
`;

export function OfflineBanner() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const iconColor = theme.colors.primaryFg;

  return (
    <Bar $insetTop={insets.top}>
      <MaterialCommunityIcons name="wifi-off" size={18} color={iconColor} />
      <BarText type="default">No internet connection</BarText>
    </Bar>
  );
}
