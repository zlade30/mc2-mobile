import React, { useEffect } from "react";
import { Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { styled } from "styled-components/native";

import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { Shadows } from "@/shared/theme";

const SkeletonLine = styled(Animated.View)<{
  $width?: string;
  $height?: number;
}>`
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border-radius: ${({ theme }) => theme.radii.sm};
  height: ${({ $height }) => $height ?? 16}px;
  width: ${({ $width }) => $width ?? "100%"};
`;

const SkeletonCard = styled.View<{ $bg?: string }>`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.xl};
  overflow: hidden;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : "elevation: 3;"}
`;

const SkeletonHeader = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  gap: ${({ theme }) => theme.spacing.xs};
`;

const SkeletonImageBlock = styled.View<{ $bg?: string }>`
  width: 100%;
  aspect-ratio: 16/9;
  min-height: 120px;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const SkeletonBody = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.sm};
`;

export function PromoDetailSkeleton() {
  const cardBg = useThemeColor({}, "surface");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const skeletonOpacity = useSharedValue(0.6);

  useEffect(() => {
    skeletonOpacity.value = withRepeat(
      withTiming(1, { duration: 600 }),
      -1,
      true,
    );
  }, [skeletonOpacity]);

  const skeletonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: skeletonOpacity.value,
  }));

  return (
    <SkeletonCard $bg={cardBg}>
      <SkeletonHeader>
        <SkeletonLine
          $height={20}
          $width="85%"
          style={skeletonAnimatedStyle}
        />
        <SkeletonLine
          $height={12}
          $width="40%"
          style={skeletonAnimatedStyle}
        />
      </SkeletonHeader>
      <SkeletonImageBlock $bg={surfaceElevated} />
      <SkeletonBody>
        <SkeletonLine $height={16} style={skeletonAnimatedStyle} />
        <SkeletonLine $height={16} style={skeletonAnimatedStyle} />
        <SkeletonLine
          $height={16}
          $width="84%"
          style={skeletonAnimatedStyle}
        />
        <SkeletonLine
          $height={220}
          $width="100%"
          style={skeletonAnimatedStyle}
        />
      </SkeletonBody>
    </SkeletonCard>
  );
}
