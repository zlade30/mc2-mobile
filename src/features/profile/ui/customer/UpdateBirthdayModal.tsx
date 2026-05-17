import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { styled, useTheme } from "styled-components/native";

import { getErrorMessage } from "@/shared/lib/utils";
import { BirthdayDatePicker } from "@/shared/ui/birthday-date-picker";
import { BottomModalView } from "@/shared/ui/bottom-modal";
import { ThemedText } from "@/shared/ui/themed-text";

import { updateCustomerProfile } from "../../api";

const Description = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: ${({ theme }) => theme.typography.bodyLineHeight}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ConfirmDate = styled(ThemedText)`
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorText = styled(ThemedText)`
  margin-top: 4px;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ActionButton = styled(Pressable)<{ $variant: "primary" | "secondary" }>`
  flex: 1;
  padding-vertical: 14px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $variant }) =>
    $variant === "primary"
      ? theme.colors.primary
      : theme.colors.surfaceElevated};
  border-width: ${({ $variant }) => ($variant === "secondary" ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.border};
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};
`;

const ActionButtonText = styled(ThemedText)<{
  $variant: "primary" | "secondary";
}>`
  font-size: 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
  color: ${({ theme, $variant }) =>
    $variant === "primary" ? theme.colors.primaryFg : theme.colors.text};
`;

export type UpdateBirthdayModalProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type Step = "pick" | "confirm";

export function UpdateBirthdayModal({
  visible,
  onClose,
  onSuccess,
}: UpdateBirthdayModalProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("pick");

  useEffect(() => {
    if (visible) {
      setValue("");
      setError(null);
      setStep("pick");
    }
  }, [visible]);

  const mutation = useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["customerProfile"] });
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      setError(getErrorMessage(err));
      setStep("pick");
    },
  });

  const handleChange = useCallback((next: string) => {
    setValue(next);
    setError(null);
  }, []);

  const handleSavePress = useCallback(() => {
    if (!value) {
      setError("Please pick your birthday.");
      return;
    }
    const parsed = dayjs(value, "YYYY-MM-DD", true);
    if (!parsed.isValid()) {
      setError("That's not a valid date.");
      return;
    }
    if (parsed.isAfter(dayjs(), "day")) {
      setError("Birthday can't be in the future.");
      return;
    }
    setError(null);
    setStep("confirm");
  }, [value]);

  const handleConfirm = useCallback(() => {
    mutation.mutate({ date_of_birth: value });
  }, [mutation, value]);

  const handleBackToPick = useCallback(() => {
    setStep("pick");
  }, []);

  const isSaving = mutation.isPending;
  const formattedDate = value
    ? dayjs(value, "YYYY-MM-DD", true).format("MMMM D, YYYY")
    : "";

  return (
    <BottomModalView
      visible={visible}
      onClose={onClose}
      title={step === "pick" ? "Add your birthday" : "Confirm your birthday"}
    >
      {step === "pick" ? (
        <Animated.View
          key="pick"
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(150)}
        >
          <Description type="default">
            Pick your birthday to receive a special reward on your special day.
          </Description>
          <BirthdayDatePicker value={value} onChange={handleChange} />
          {error ? <ErrorText type="caption">{error}</ErrorText> : null}
          <ButtonRow>
            <ActionButton
              $variant="secondary"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <ActionButtonText $variant="secondary">Cancel</ActionButtonText>
            </ActionButton>
            <ActionButton
              $variant="primary"
              onPress={handleSavePress}
              accessibilityRole="button"
              accessibilityLabel="Save birthday"
            >
              <ActionButtonText $variant="primary">Save</ActionButtonText>
            </ActionButton>
          </ButtonRow>
        </Animated.View>
      ) : (
        <Animated.View
          key="confirm"
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(150)}
        >
          <Description type="default">
            Set your birthday to{" "}
            <ConfirmDate type="default">{formattedDate}</ConfirmDate>?
          </Description>
          {error ? <ErrorText type="caption">{error}</ErrorText> : null}
          <ButtonRow>
            <ActionButton
              $variant="secondary"
              onPress={handleBackToPick}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Back"
            >
              <ActionButtonText $variant="secondary">Back</ActionButtonText>
            </ActionButton>
            <ActionButton
              $variant="primary"
              onPress={handleConfirm}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel="Confirm birthday"
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primaryFg}
                />
              ) : (
                <ActionButtonText $variant="primary">Confirm</ActionButtonText>
              )}
            </ActionButton>
          </ButtonRow>
        </Animated.View>
      )}
    </BottomModalView>
  );
}
