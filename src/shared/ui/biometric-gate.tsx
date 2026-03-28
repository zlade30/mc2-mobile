import { Lock, LockKeyhole } from "@solar-icons/react-native/Broken";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { styled, useTheme } from "styled-components/native";

import {
  authenticateAsync,
  AuthenticationType,
  hasHardwareAsync,
  isEnrolledAsync,
  supportedAuthenticationTypesAsync,
} from "@/shared/lib/biometric";
import {
  isPinSet,
  PIN_LENGTH,
  setPin as savePin,
  verifyPin,
} from "@/shared/lib/pin";
import { PrimaryButton } from "@/shared/ui/button";
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

const ButtonWrapper = styled.View`
  width: 100%;
  max-width: 280px;
`;

const ScrollContent = styled(ScrollView).attrs({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
    paddingBottom: 320,
  },
  keyboardShouldPersistTaps: "handled",
  keyboardDismissMode: "on-drag",
  showsVerticalScrollIndicator: false,
})``;

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

export type BiometricGateProps = {
  onSuccess: () => void;
};

function getUnlockMessage(types: AuthenticationType[]): string {
  const hasFace = types.includes(AuthenticationType.FACIAL_RECOGNITION);
  const hasFingerprint = types.includes(AuthenticationType.FINGERPRINT);
  if (hasFace && hasFingerprint) return "Unlock with Face ID or fingerprint";
  if (hasFace) return "Unlock with Face ID";
  if (hasFingerprint) return "Unlock with fingerprint";
  return "Unlock with biometrics";
}

type PinStatus = "loading" | "set" | "unset";

type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  editable?: boolean;
};

function PinInput({
  value,
  onChange,
  onComplete,
  autoFocus = true,
  editable = true,
}: PinInputProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!editable) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, [editable]);

  const handleFocus = useCallback(() => {
    if (!editable) {
      inputRef.current?.blur();
    }
  }, [editable]);

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
    if (editable) inputRef.current?.focus();
  }, [editable]);

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
          onFocus={handleFocus}
          keyboardType="number-pad"
          maxLength={PIN_LENGTH}
          autoFocus={autoFocus}
          editable={editable}
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

export function BiometricGate({ onSuccess }: BiometricGateProps) {
  const theme = useTheme();
  const [unlockMessage, setUnlockMessage] = useState<string>(
    "Unlock with Face ID or fingerprint",
  );
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [pinStatus, setPinStatus] = useState<PinStatus>("loading");
  const [pinError, setPinError] = useState<string | null>(null);
  const [firstPin, setFirstPin] = useState<string>("");

  const handleBiometricNotAvailable = useCallback(async () => {
    // A single auth call can transiently return "not_available" on iOS.
    // Re-check hardware + enrollment before forcing PIN fallback.
    const [hasHardware, isEnrolled] = await Promise.all([
      hasHardwareAsync(),
      isEnrolledAsync(),
    ]);
    const canUseBiometric = hasHardware && isEnrolled;
    setAvailable(canUseBiometric);
    if (!canUseBiometric) {
      setError("Biometrics not available. Unlock with your PIN.");
    } else {
      setError("Authentication failed. Try again.");
    }
  }, []);

  const runAuth = useCallback(
    async (promptMsg?: string) => {
      setError(null);
      const message = promptMsg ?? unlockMessage;
      try {
        const result = await authenticateAsync({
          promptMessage: message,
        });
        if (result.success) {
          onSuccess();
        } else {
          if (
            result.error === "user_cancel" ||
            result.error === "system_cancel" ||
            result.error === "app_cancel"
          ) {
            setError(null);
          } else if (result.error === "not_available") {
            await handleBiometricNotAvailable();
          } else {
            setError("Authentication failed. Try again.");
          }
        }
      } catch {
        setError("Authentication failed. Try again.");
      }
    },
    [handleBiometricNotAvailable, onSuccess, unlockMessage],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [hasHardware, isEnrolled, types] = await Promise.all([
          hasHardwareAsync(),
          isEnrolledAsync(),
          supportedAuthenticationTypesAsync(),
        ]);
        if (cancelled) return;
        const msg = types.length > 0 ? getUnlockMessage(types) : unlockMessage;
        setUnlockMessage(msg);
        setAvailable(hasHardware && isEnrolled);
        if (!hasHardware || !isEnrolled) {
          setError("Biometrics not available. Unlock with your PIN.");
          return;
        }
        const result = await authenticateAsync({
          promptMessage: msg,
        });
        if (cancelled) return;
        if (result.success) {
          onSuccess();
        } else if (
          result.error !== "user_cancel" &&
          result.error !== "system_cancel" &&
          result.error !== "app_cancel" &&
          result.error !== "not_available"
        ) {
          setError("Authentication failed. Try again.");
        } else if (result.error === "not_available") {
          await handleBiometricNotAvailable();
        }
      } catch {
        if (!cancelled) {
          setAvailable(false);
          setError("Biometrics not available. Unlock with your PIN.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; unlockMessage is set inside
  }, [handleBiometricNotAvailable, onSuccess]);

  useEffect(() => {
    if (available !== false) return;
    let cancelled = false;
    isPinSet()
      .then((set) => {
        if (!cancelled) setPinStatus(set ? "set" : "unset");
      })
      .catch(() => {
        if (!cancelled) setPinStatus("unset");
      });
    return () => {
      cancelled = true;
    };
  }, [available]);

  const handleCreatePinComplete = useCallback(
    async (pin: string) => {
      if (firstPin === "") {
        setFirstPin(pin);
        setCreatePinValue("");
        setPinError(null);
        return;
      }
      if (firstPin !== pin) {
        setPinError("PINs don't match. Try again.");
        setFirstPin("");
        setCreatePinValue("");
        return;
      }
      setPinError(null);
      try {
        await savePin(pin);
        onSuccess();
      } catch {
        setPinError("Could not save PIN. Try again.");
        setCreatePinValue("");
      }
    },
    [firstPin, onSuccess],
  );

  const handleEnterPinComplete = useCallback(
    async (pin: string) => {
      setPinError(null);
      const ok = await verifyPin(pin);
      if (ok) {
        onSuccess();
      } else {
        setPinError("Wrong PIN. Try again.");
      }
    },
    [onSuccess],
  );

  const [createPinValue, setCreatePinValue] = useState("");
  const [enterPinValue, setEnterPinValue] = useState("");

  if (available === false) {
    if (pinStatus === "loading") {
      return (
        <Container edges={["top", "left", "right", "bottom"]}>
          <IconWrapper>
            <Lock size={64} color={theme.colors.screenIcon} />
          </IconWrapper>
          <Title type="title">Biometrics unavailable</Title>
          <Subtitle type="caption">Checking for PIN…</Subtitle>
        </Container>
      );
    }

    if (pinStatus === "unset") {
      return (
        <Container edges={["top", "left", "right", "bottom"]}>
          <KeyboardAvoidingView
            style={{ flex: 1, width: "100%" }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
          >
            <ScrollContent>
              <IconWrapper>
                <Lock size={64} color={theme.colors.screenIcon} />
              </IconWrapper>
              <Title type="title">
                {firstPin === "" ? "Create your PIN" : "Confirm your PIN"}
              </Title>
              <Subtitle type="caption">
                {firstPin === ""
                  ? `Enter a ${PIN_LENGTH}-digit PIN to unlock the app when biometrics aren't available.`
                  : "Enter your PIN again to confirm."}
              </Subtitle>
              {pinError ? (
                <ErrorText type="caption">{pinError}</ErrorText>
              ) : null}
              <PinInput
                value={createPinValue}
                onChange={(v) => {
                  setCreatePinValue(v);
                  setPinError(null);
                }}
                onComplete={handleCreatePinComplete}
              />
            </ScrollContent>
          </KeyboardAvoidingView>
        </Container>
      );
    }

    return (
      <Container edges={["top", "left", "right", "bottom"]}>
        <KeyboardAvoidingView
          style={{ flex: 1, width: "100%" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <ScrollContent>
            <IconWrapper>
              <Lock size={64} color={theme.colors.screenIcon} />
            </IconWrapper>
            <Title type="title">Enter your PIN</Title>
            <Subtitle type="caption">
              Enter your {PIN_LENGTH}-digit PIN to continue.
            </Subtitle>
            {pinError ? <ErrorText type="caption">{pinError}</ErrorText> : null}
            <PinInput
              value={enterPinValue}
              onChange={(v) => {
                setEnterPinValue(v);
                setPinError(null);
              }}
              onComplete={async (pin) => {
                await handleEnterPinComplete(pin);
                setEnterPinValue("");
              }}
            />
          </ScrollContent>
        </KeyboardAvoidingView>
      </Container>
    );
  }

  return (
    <Container edges={["top", "left", "right", "bottom"]}>
      <IconWrapper>
        <LockKeyhole size={64} color={theme.colors.screenIcon} />
      </IconWrapper>
      <Title type="title">{unlockMessage}</Title>
      <Subtitle type="caption">Verify your identity to continue</Subtitle>
      {error ? <ErrorText type="caption">{error}</ErrorText> : null}
      <ButtonWrapper>
        <PrimaryButton onPress={() => void runAuth()}>Unlock</PrimaryButton>
      </ButtonWrapper>
    </Container>
  );
}
