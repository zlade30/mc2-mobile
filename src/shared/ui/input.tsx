import React, { useState } from "react";
import { Pressable, TextInput, type TextInputProps } from "react-native";
import { styled, useTheme } from "styled-components/native";

import { ThemedText } from "@/shared/ui/themed-text";
import { Eye, EyeClosed } from "@solar-icons/react-native/Broken";

const StyledInput = styled(TextInput)<{ $hasError?: boolean }>`
  border-width: 1px;
  border-radius: ${(p) => p.theme.radii.md};
  padding-horizontal: 16px;
  padding-vertical: 14px;
  font-size: 16px;
  font-family: ${(p) => p.theme.typography.fontFamily.regular};
  margin-bottom: ${(p) => p.theme.spacing.sm};
  border-color: ${(p) =>
    p.$hasError ? p.theme.colors.error : p.theme.colors.inputBorder};
  color: ${(p) => p.theme.colors.text};
  background-color: ${(p) => p.theme.colors.inputBackground};
`;

export type InputProps = TextInputProps & {
  hasError?: boolean;
};

export function Input({
  hasError = false,
  style,
  placeholderTextColor,
  ...rest
}: InputProps) {
  const theme = useTheme();
  return (
    <StyledInput
      $hasError={hasError}
      placeholderTextColor={
        placeholderTextColor ??
        theme.colors.placeholder ??
        theme.colors.textSecondary
      }
      style={style}
      {...rest}
    />
  );
}

const PasswordWrapper = styled.View`
  position: relative;
  margin-bottom: ${(p) => p.theme.spacing.sm};
`;

const PasswordInputStyled = styled(StyledInput)`
  margin-bottom: 0;
  padding-right: 48px;
`;

const EyeButtonStyled = styled(Pressable)`
  position: absolute;
  right: 12px;
  top: 0;
  bottom: 0;
  justify-content: center;
`;

export type PasswordInputProps = Omit<TextInputProps, "secureTextEntry"> & {
  hasError?: boolean;
};

export function PasswordInput({
  hasError = false,
  ...rest
}: PasswordInputProps) {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  return (
    <PasswordWrapper>
      <PasswordInputStyled
        $hasError={hasError}
        secureTextEntry={!visible}
        placeholderTextColor={
          rest.placeholderTextColor ?? theme.colors.placeholder
        }
        {...rest}
      />
      <EyeButtonStyled
        onPress={() => setVisible((v) => !v)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        {visible ? (
          <Eye size={22} color={theme.colors.placeholder} />
        ) : (
          <EyeClosed size={22} color={theme.colors.placeholder} />
        )}
      </EyeButtonStyled>
    </PasswordWrapper>
  );
}

const FormFieldLabel = styled(ThemedText)`
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
`;

const FormFieldError = styled(ThemedText)`
  font-size: 12px;
  margin-bottom: ${(p) => p.theme.spacing.lg};
  color: ${(p) => p.theme.colors.error};
`;

export type FormFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
  first?: boolean;
};

const FormFieldLabelFirst = styled(FormFieldLabel)`
  margin-top: ${(p) => p.theme.spacing.xl};
`;

export function FormField({
  label,
  error,
  children,
  first = false,
}: FormFieldProps) {
  const LabelComponent = first ? FormFieldLabelFirst : FormFieldLabel;
  return (
    <>
      <LabelComponent>{label}</LabelComponent>
      {children}
      {error ? <FormFieldError>{error}</FormFieldError> : null}
    </>
  );
}
