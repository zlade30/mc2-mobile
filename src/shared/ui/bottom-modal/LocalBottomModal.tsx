import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Modal, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styled, useTheme } from "styled-components/native";

import { ThemedText } from "@/shared/ui/themed-text";

import type { BottomModalState } from "./types";

const ANIMATION_DURATION = 300;

const Overlay = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Backdrop = styled(AnimatedPressable)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

const Panel = styled(Animated.View)<{ $paddingBottom: number }>`
  width: 100%;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-top: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ $paddingBottom }) => $paddingBottom}px;
  border-top-left-radius: ${({ theme }) => theme.radii.xxl};
  border-top-right-radius: ${({ theme }) => theme.radii.xxl};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Title = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.extraBold};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
`;

const Message = styled(ThemedText)<{ $color?: string }>`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: ${({ theme }) => theme.typography.bodyLineHeight}px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const ButtonRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const ButtonWrap = styled.View<{ $flex?: number }>`
  flex: ${({ $flex }) => $flex ?? 1};
`;

const StyledButton = styled(Pressable)<{
  $variant: "primary" | "secondary" | "destructive";
}>`
  padding-vertical: 14px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $variant }) =>
    $variant === "primary"
      ? theme.colors.primary
      : $variant === "destructive"
        ? theme.colors.error
        : theme.colors.surfaceElevated};
  border-width: ${({ $variant }) => ($variant === "secondary" ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const ButtonText = styled(ThemedText)<{
  $variant: "primary" | "secondary" | "destructive";
}>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme, $variant }) =>
    $variant === "primary" || $variant === "destructive"
      ? theme.colors.primaryForeground
      : theme.colors.text};
`;

const CustomContentWrap = styled.View`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export type LocalBottomModalProps = {
  state: BottomModalState;
  onHide: () => void;
  /** Returns the latest state synchronously; used to detect mid-callback transitions. */
  getState: () => BottomModalState;
};

export function LocalBottomModal({
  state,
  onHide,
  getState,
}: LocalBottomModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const {
    visible,
    type,
    title,
    message,
    confirmText,
    cancelText,
    destructive,
    keepOpenOnConfirm,
    onConfirm,
    onCancel,
    onClose,
    content,
  } = state;

  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const { height: screenHeight } = Dimensions.get("window");
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(screenHeight);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      translateY.value = withTiming(0, { duration: ANIMATION_DURATION });
    } else {
      backdropOpacity.value = 0;
      translateY.value = screenHeight;
    }
  }, [visible, screenHeight, backdropOpacity, translateY]);

  const closeWithAnimation = (afterClose?: () => void) => {
    backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION });
    translateY.value = withTiming(screenHeight, {
      duration: ANIMATION_DURATION,
    });
    setTimeout(() => {
      onHide();
      afterClose?.();
    }, ANIMATION_DURATION);
  };

  const handleBackdropPress = () => {
    if (isConfirmLoading) return;
    if (type === "confirm" && onCancel) {
      onCancel();
    }
    if (type === "message" && onClose) {
      onClose();
    }
    closeWithAnimation();
  };

  const handleMessageOk = () => {
    onClose?.();
    closeWithAnimation();
  };

  const handleConfirmCancel = () => {
    if (isConfirmLoading) return;
    onCancel?.();
    closeWithAnimation();
  };

  const handleConfirmConfirm = async () => {
    if (isConfirmLoading) return;
    const callback = onConfirm;
    if (!callback) return;

    if (!keepOpenOnConfirm) {
      closeWithAnimation(callback as () => void);
      return;
    }

    setIsConfirmLoading(true);
    try {
      await Promise.resolve(callback());
      setIsConfirmLoading(false);
      // If the callback opened a new modal (e.g. called showMessage/showConfirm),
      // the state's onConfirm will no longer match the original callback.
      // In that case do NOT close — the new modal is already showing.
      if (getState().onConfirm === callback) {
        closeWithAnimation();
      }
    } catch {
      // Keep modal open; the caller can show an error message.
      setIsConfirmLoading(false);
    }
  };

  const handleCustomClose = () => {
    onClose?.();
    closeWithAnimation();
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const textMuted = theme.colors.textSecondary;
  const paddingBottom = Math.max(insets.bottom, 24);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (type === "confirm" && isConfirmLoading) return;
        if (type === "confirm") onCancel?.();
        if (type === "message") onClose?.();
        if (type === "custom") onClose?.();
        closeWithAnimation();
      }}
    >
      <Overlay>
        <Backdrop
          style={backdropStyle}
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <Panel style={panelStyle} $paddingBottom={paddingBottom}>
          {type === "message" && (
            <>
              {title != null && <Title type="subtitle">{title}</Title>}
              {message != null && (
                <Message type="default" $color={textMuted}>
                  {message}
                </Message>
              )}
              <ButtonRow>
                <ButtonWrap $flex={1}>
                  <StyledButton
                    $variant="primary"
                    onPress={handleMessageOk}
                    accessibilityRole="button"
                    accessibilityLabel="OK"
                  >
                    <ButtonText $variant="primary">OK</ButtonText>
                  </StyledButton>
                </ButtonWrap>
              </ButtonRow>
            </>
          )}
          {type === "confirm" && (
            <>
              {title != null && <Title type="subtitle">{title}</Title>}
              {message != null && (
                <Message type="default" $color={textMuted}>
                  {message}
                </Message>
              )}
              <ButtonRow>
                <ButtonWrap $flex={1}>
                  <StyledButton
                    $variant="secondary"
                    onPress={handleConfirmCancel}
                    disabled={isConfirmLoading}
                    accessibilityRole="button"
                    accessibilityLabel={cancelText ?? "Cancel"}
                  >
                    <ButtonText $variant="secondary">
                      {cancelText ?? "Cancel"}
                    </ButtonText>
                  </StyledButton>
                </ButtonWrap>
                <ButtonWrap $flex={1}>
                  <StyledButton
                    $variant={destructive ? "destructive" : "primary"}
                    onPress={handleConfirmConfirm}
                    disabled={isConfirmLoading}
                    accessibilityRole="button"
                    accessibilityLabel={confirmText ?? "Confirm"}
                  >
                    {isConfirmLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={theme.colors.primaryForeground}
                      />
                    ) : (
                      <ButtonText
                        $variant={destructive ? "destructive" : "primary"}
                      >
                        {confirmText ?? "Confirm"}
                      </ButtonText>
                    )}
                  </StyledButton>
                </ButtonWrap>
              </ButtonRow>
            </>
          )}
          {type === "custom" && (
            <>
              {title != null && <Title type="subtitle">{title}</Title>}
              <CustomContentWrap>{content}</CustomContentWrap>
              <ButtonRow>
                <ButtonWrap $flex={1}>
                  <StyledButton
                    $variant="primary"
                    onPress={handleCustomClose}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                  >
                    <ButtonText $variant="primary">Close</ButtonText>
                  </StyledButton>
                </ButtonWrap>
              </ButtonRow>
            </>
          )}
        </Panel>
      </Overlay>
    </Modal>
  );
}
