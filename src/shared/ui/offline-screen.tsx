import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { styled, useTheme } from "styled-components/native";

import { PrimaryButton } from "@/shared/ui/button";
import { ThemedText } from "@/shared/ui/themed-text";

const Container = styled.View`
  flex: 1;
  background-color: ${(p) => p.theme.colors.background};
  justify-content: center;
  align-items: center;
  padding: ${(p) => p.theme.spacing.xl};
`;

const IconWrapper = styled.View`
  margin-bottom: ${(p) => p.theme.spacing.xxl};
`;

const Title = styled(ThemedText)`
  text-align: center;
  margin-bottom: ${(p) => p.theme.spacing.sm};
`;

const Message = styled(ThemedText)`
  text-align: center;
  margin-bottom: ${(p) => p.theme.spacing.xxl};
  max-width: 320px;
`;

export type OfflineScreenProps = {
  onRetry: () => void;
};

export function OfflineScreen({ onRetry }: OfflineScreenProps) {
  const theme = useTheme();
  const iconColor = theme.colors.textSecondary;

  return (
    <Container>
      <IconWrapper>
        <MaterialCommunityIcons
          name="wifi-off"
          size={64}
          color={iconColor}
        />
      </IconWrapper>
      <Title type="title">No internet connection</Title>
      <Message type="default">
        Check your connection and try again.
      </Message>
      <PrimaryButton onPress={onRetry}>Retry</PrimaryButton>
    </Container>
  );
}
