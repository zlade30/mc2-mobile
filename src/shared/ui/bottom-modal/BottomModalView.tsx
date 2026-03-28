import type { ReactNode } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Modal, Pressable } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styled } from "styled-components/native";

import { ThemedText } from "@/shared/ui/themed-text";

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

const ContentWrap = styled.View`
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

export type BottomModalViewProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function BottomModalView({
  visible,
  onClose,
  title,
  children,
}: BottomModalViewProps) {
  const insets = useSafeAreaInsets();
  const { height: screenHeight } = Dimensions.get("window");
  const [isClosing, setIsClosing] = useState(false);
  const wasVisibleRef = useRef(false);

  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(screenHeight);

  const runOnClose = () => {
    onClose();
    setIsClosing(false);
  };

  useEffect(() => {
    if (visible) {
      wasVisibleRef.current = true;
      setIsClosing(false);
      backdropOpacity.value = withTiming(1, { duration: ANIMATION_DURATION });
      translateY.value = withTiming(0, { duration: ANIMATION_DURATION });
    } else if (wasVisibleRef.current) {
      wasVisibleRef.current = false;
      setIsClosing(true);
      backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION });
      translateY.value = withTiming(
        screenHeight,
        { duration: ANIMATION_DURATION },
        (finished) => {
          if (finished) {
            runOnJS(runOnClose)();
          }
        },
      );
    }
  }, [
    visible,
    screenHeight,
    backdropOpacity,
    translateY,
  ]);

  const handleBackdropPress = () => {
    if (!visible && !isClosing) return;
    wasVisibleRef.current = false;
    setIsClosing(true);
    backdropOpacity.value = withTiming(0, { duration: ANIMATION_DURATION });
    translateY.value = withTiming(
      screenHeight,
      { duration: ANIMATION_DURATION },
      (finished) => {
        if (finished) {
          runOnJS(runOnClose)();
        }
      },
    );
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const paddingBottom = Math.max(insets.bottom, 24);
  const show = visible || isClosing;

  if (!show) {
    return null;
  }

  return (
    <Modal
      visible={show}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleBackdropPress}
    >
      <Overlay>
        <Backdrop
          style={backdropStyle}
          onPress={handleBackdropPress}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <Panel style={panelStyle} $paddingBottom={paddingBottom}>
          {title != null && <Title type="subtitle">{title}</Title>}
          <ContentWrap>{children}</ContentWrap>
        </Panel>
      </Overlay>
    </Modal>
  );
}
