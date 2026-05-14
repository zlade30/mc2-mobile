import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { styled } from "styled-components/native";

import { ThemedText } from "@/shared/ui/themed-text";

const Container = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding-vertical: 12px;
  padding-horizontal: ${(p) => p.theme.spacing.xxl};
  border-radius: ${(p) => p.theme.radii.md};
  background-color: ${(p) => p.theme.colors.surface};
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  opacity: ${(p) => (p.accessibilityState?.disabled ? 0.6 : 1)};
`;

const Label = styled(ThemedText)`
  font-size: 16px;
  font-weight: 600;
`;

const DividerRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: ${(p) => p.theme.spacing.lg};
  gap: ${(p) => p.theme.spacing.sm};
`;

const DividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${(p) => p.theme.colors.border};
`;

const DividerText = styled(ThemedText)`
  font-size: 12px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

export type GoogleSignInButtonProps = {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
};

export function OrDivider({ text = "or" }: { text?: string }) {
  return (
    <DividerRow>
      <DividerLine />
      <DividerText>{text}</DividerText>
      <DividerLine />
    </DividerRow>
  );
}

export function GoogleSignInButton({
  onPress,
  loading = false,
  disabled = false,
  label = "Continue with Google",
}: GoogleSignInButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Container
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          <View>
            <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
          </View>
          <Label>{label}</Label>
        </>
      )}
    </Container>
  );
}
