import React from "react";
import { type ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styled } from "styled-components/native";

import { useThemeStore } from "@/shared/store";

const StyledView = styled.View<{ $bg?: string }>`
  background-color: ${(p) => p.$bg ?? p.theme.colors.background};
`;

const StyledSafeAreaView = styled(SafeAreaView)<{ $bg?: string }>`
  background-color: ${(p) => p.$bg ?? p.theme.colors.background};
`;

type SafeAreaEdge = "top" | "bottom" | "left" | "right";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export type ThemedSafeAreaViewProps = ThemedViewProps & {
  edges?: readonly SafeAreaEdge[];
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedViewProps) {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const bg =
    colorScheme === "dark"
      ? (darkColor ?? lightColor)
      : (lightColor ?? darkColor);

  return <StyledView $bg={bg} style={style} {...rest} />;
}

export function ThemedSafeAreaView({
  style,
  lightColor,
  darkColor,
  edges,
  ...rest
}: ThemedSafeAreaViewProps) {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const bg =
    colorScheme === "dark"
      ? (darkColor ?? lightColor)
      : (lightColor ?? darkColor);

  return (
    <StyledSafeAreaView
      $bg={bg}
      style={style}
      edges={edges}
      {...rest}
    />
  );
}
