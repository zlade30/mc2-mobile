import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback, useState } from "react";
import { Pressable } from "react-native";
import { styled, useTheme } from "styled-components/native";

import { BottomModalView } from "./bottom-modal";
import { BirthdayDatePicker } from "./birthday-date-picker";
import { ThemedText } from "./themed-text";

const FieldButton = styled(Pressable)<{ $hasError?: boolean }>`
  border-width: 1px;
  border-radius: ${({ theme }) => theme.radii.md};
  padding-horizontal: 16px;
  padding-vertical: 14px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-color: ${({ theme, $hasError }) =>
    $hasError ? theme.colors.error : theme.colors.inputBorder};
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const FieldText = styled(ThemedText)<{ $placeholder?: boolean }>`
  font-size: 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
  color: ${({ theme, $placeholder }) =>
    $placeholder
      ? theme.colors.placeholder ?? theme.colors.textSecondary
      : theme.colors.text};
`;

const ActionsRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const ActionBtn = styled(Pressable)<{ $variant: "primary" | "secondary" }>`
  flex: 1;
  padding-vertical: 14px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $variant }) =>
    $variant === "primary" ? theme.colors.primary : theme.colors.surfaceElevated};
  border-width: ${({ $variant }) => ($variant === "secondary" ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ActionBtnText = styled(ThemedText)<{ $variant: "primary" | "secondary" }>`
  font-size: 16px;
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
  color: ${({ theme, $variant }) =>
    $variant === "primary" ? theme.colors.primaryFg : theme.colors.text};
`;

export type BirthdayPickerFieldProps = {
  /** Selected value as YYYY-MM-DD, or empty string. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  disabled?: boolean;
  /** Modal title shown at the top of the sheet. */
  title?: string;
};

export function BirthdayPickerField({
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  hasError = false,
  disabled = false,
  title = "Pick your birthday",
}: BirthdayPickerFieldProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState(value);

  const open = useCallback(() => {
    setDraft(value);
    setVisible(true);
  }, [value]);

  const close = useCallback(() => setVisible(false), []);

  const handleConfirm = useCallback(() => {
    onChange(draft);
    setVisible(false);
  }, [draft, onChange]);

  const display = value;

  return (
    <>
      <FieldButton
        onPress={open}
        disabled={disabled}
        $hasError={hasError}
        accessibilityRole="button"
        accessibilityLabel={value ? `Birthday: ${display}` : "Pick birthday"}
      >
        <FieldText type="default" $placeholder={!display}>
          {display || placeholder}
        </FieldText>
        <MaterialCommunityIcons
          name="calendar-month-outline"
          size={20}
          color={theme.colors.textSecondary}
        />
      </FieldButton>

      <BottomModalView visible={visible} onClose={close} title={title}>
        <BirthdayDatePicker value={draft} onChange={setDraft} />
        <ActionsRow>
          <ActionBtn
            $variant="secondary"
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
          >
            <ActionBtnText $variant="secondary">Cancel</ActionBtnText>
          </ActionBtn>
          <ActionBtn
            $variant="primary"
            onPress={handleConfirm}
            disabled={!draft}
            accessibilityRole="button"
            accessibilityLabel="Confirm"
          >
            <ActionBtnText $variant="primary">Done</ActionBtnText>
          </ActionBtn>
        </ActionsRow>
      </BottomModalView>
    </>
  );
}
