import { Lock } from "@solar-icons/react-native/Broken";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { styled, useTheme } from "styled-components/native";

import { PIN_LENGTH, setPin as savePin } from "@/shared/lib/pin";
import { LinkButton } from "@/shared/ui/button";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
`;

const IconWrapper = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled(ThemedText)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Subtitle = styled(ThemedText)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const ErrorText = styled(ThemedText)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.error};
`;

const PinSquaresRow = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const PinSquare = styled.View<{ $filled: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radii.md};
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  align-items: center;
  justify-content: center;
`;

const PinDot = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.colors.screenIcon};
`;

const HiddenInputWrapper = styled.View`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0.01;
  overflow: hidden;
  left: 0;
  top: 0;
`;

const PinTouchArea = styled(TouchableOpacity)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
};

function PinInput({
  value,
  onChange,
  onComplete,
  autoFocus = true,
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = useCallback(
    (text: string) => {
      const digits = text.replace(/\D/g, "").slice(0, PIN_LENGTH);
      onChange(digits);
      if (digits.length === PIN_LENGTH && onComplete) {
        onComplete(digits);
      }
    },
    [onChange, onComplete],
  );

  const handleTap = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <PinSquaresRow>
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <PinSquare key={i} $filled={i < value.length}>
          {i < value.length ? <PinDot /> : null}
        </PinSquare>
      ))}
      <HiddenInputWrapper>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={PIN_LENGTH}
          autoFocus={autoFocus}
          showSoftInputOnFocus={Platform.OS === "android"}
          accessibilityLabel="PIN entry"
        />
      </HiddenInputWrapper>
      <PinTouchArea
        activeOpacity={1}
        onPress={handleTap}
        accessible
        accessibilityLabel="Tap to enter PIN"
        accessibilityRole="button"
      />
    </PinSquaresRow>
  );
}

export type CreatePinViewProps = {
  onSuccess: () => void;
  onCancel?: () => void;
};

export function CreatePinView({ onSuccess, onCancel }: CreatePinViewProps) {
  const theme = useTheme();
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [firstPin, setFirstPin] = useState("");
  const [pinValue, setPinValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateComplete = useCallback((pin: string) => {
    setFirstPin(pin);
    setPinValue("");
    setError(null);
    setStep("confirm");
  }, []);

  const handleConfirmComplete = useCallback(
    async (pin: string) => {
      if (firstPin !== pin) {
        setError("PINs don't match. Try again.");
        setFirstPin("");
        setPinValue("");
        setStep("create");
        return;
      }
      setError(null);
      try {
        await savePin(pin);
        onSuccess();
      } catch {
        setError("Could not save PIN. Try again.");
        setPinValue("");
      }
    },
    [firstPin, onSuccess],
  );

  return (
    <Container edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1, width: "100%", justifyContent: "center" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <IconWrapper>
          <Lock size={64} color={theme.colors.screenIcon} />
        </IconWrapper>
        <Title type="title">
          {step === "create" ? "Create your PIN" : "Confirm your PIN"}
        </Title>
        <Subtitle type="caption">
          {step === "create"
            ? `Enter a ${PIN_LENGTH}-digit PIN to unlock the app.`
            : "Enter your PIN again to confirm."}
        </Subtitle>
        {error ? <ErrorText type="caption">{error}</ErrorText> : null}
        <PinInput
          value={pinValue}
          onChange={(v) => {
            setPinValue(v);
            setError(null);
          }}
          onComplete={
            step === "create" ? handleCreateComplete : handleConfirmComplete
          }
        />
        {onCancel ? (
          <ButtonRow>
            <LinkButton onPress={onCancel}>Cancel</LinkButton>
          </ButtonRow>
        ) : null}
      </KeyboardAvoidingView>
    </Container>
  );
}
