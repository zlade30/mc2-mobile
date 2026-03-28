import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import {
  ActivityIndicator,
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  TouchableOpacity,
} from "react-native";
import { styled, useTheme } from "styled-components/native";

import { ThemedText } from "@/shared/ui/themed-text";

type StyledPrimaryButtonProps = { $size?: "default" | "small" };

const StyledPrimaryButton = styled(Pressable)<StyledPrimaryButtonProps>`
  padding-vertical: ${(p) => (p.$size === "small" ? "8px" : "14px")};
  padding-horizontal: ${(p) =>
    p.$size === "small" ? p.theme.spacing.md : p.theme.spacing.xxl};
  border-radius: ${(p) => p.theme.radii.md};
  flex-direction: row;
  justify-content: center;
  gap: ${(p) => (p.$size === "small" ? "6px" : "12px")};
  align-items: center;
  margin-top: ${(p) => p.theme.spacing.sm};
  background-color: ${(p) => p.theme.colors.primary};
  opacity: ${(p) => (p.accessibilityState?.disabled ? 0.6 : 1)};
`;

type PrimaryButtonTextProps = { $size?: "default" | "small" };

const PrimaryButtonText = styled(ThemedText)<PrimaryButtonTextProps>`
  color: ${(p) => p.theme.colors.primaryFg};
  font-size: ${(p) => (p.$size === "small" ? "14px" : "16px")};
  font-weight: 600;
`;

export type PrimaryButtonProps = Omit<PressableProps, "children"> & {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  children: string;
  size?: "default" | "small";
};

export function PrimaryButton({
  onPress,
  disabled,
  loading = false,
  leftIcon,
  children,
  size = "default",
  ...rest
}: PrimaryButtonProps) {
  const isDisabled = disabled ?? loading;
  return (
    <StyledPrimaryButton
      onPress={onPress}
      disabled={isDisabled}
      accessibilityState={{ disabled: isDisabled }}
      $size={size}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#F5F0E8" />
      ) : (
        <>
          {leftIcon}
          <PrimaryButtonText $size={size}>{children}</PrimaryButtonText>
        </>
      )}
    </StyledPrimaryButton>
  );
}

const StyledLinkButton = styled(Pressable)`
  align-items: center;
  padding-vertical: 12px;
  flex-direction: row;
  justify-content: center;
  gap: 6px;
`;

const LinkButtonText = styled(ThemedText)`
  color: ${(p) => p.theme.colors.screenIcon};
  font-size: 16px;
`;

export type LinkButtonProps = Omit<PressableProps, "children"> & {
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
};

export function LinkButton({
  onPress,
  children,
  rightIcon,
  ...rest
}: LinkButtonProps) {
  return (
    <StyledLinkButton onPress={onPress} {...rest}>
      {typeof children === "string" ? (
        <LinkButtonText>{children}</LinkButtonText>
      ) : (
        children
      )}
      {rightIcon}
    </StyledLinkButton>
  );
}

const StyledBackButton = styled(TouchableOpacity)`
  padding: 4px;
  justify-content: center;
  align-items: center;
`;

export type BackButtonProps = {
  onPress: (e: GestureResponderEvent) => void;
  color?: string;
};

export function BackButton({ onPress, color }: BackButtonProps) {
  const theme = useTheme();
  const iconColor = color ?? theme.colors.primary;
  return (
    <StyledBackButton
      onPress={onPress}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <MaterialCommunityIcons name="arrow-left" size={24} color={iconColor} />
    </StyledBackButton>
  );
}
