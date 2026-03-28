import React from "react";
import { styled, useTheme } from "styled-components/native";

import { PrimaryButton } from "@/shared/ui/button";
import { ThemedText } from "@/shared/ui/themed-text";
import { DangerCircle } from "@solar-icons/react-native/Broken";

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

export type ErrorScreenProps = {
  onRetry: () => void;
  error?: Error | null;
  title?: string;
  message?: string;
};

export function ErrorScreen({
  onRetry,
  title = "Something went wrong",
}: ErrorScreenProps) {
  const theme = useTheme();
  const iconColor = theme.colors.error;
  const displayMessage = "An unexpected error occurred. Please try again.";

  return (
    <Container>
      <IconWrapper>
        <DangerCircle size={64} color={iconColor} />
      </IconWrapper>
      <Title type="title">{title}</Title>
      <Message type="default">{displayMessage}</Message>
      <PrimaryButton onPress={onRetry}>Try again</PrimaryButton>
    </Container>
  );
}
