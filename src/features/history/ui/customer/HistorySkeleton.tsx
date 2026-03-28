import React from "react";
import { Platform } from "react-native";
import { styled } from "styled-components/native";

import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { Shadows, Spacing } from "@/shared/theme";
import { SurfaceCard } from "@/shared/ui/card";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const ScrollContent = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const ActivityCard = styled.View<{ $bg?: string; $opacity?: number }>`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.xxl};
  padding-vertical: ${({ theme }) => theme.spacing.xxl};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  opacity: ${({ $opacity }) => $opacity ?? 1};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : "elevation: 4;"}
`;

const ActivityCardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CalendarIconBox = styled.View<{ $bg?: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  align-items: center;
  justify-content: center;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const ActivityStats = styled.View`
  flex-direction: row;
  align-items: stretch;
`;

const ActivityStatBlock = styled.View`
  flex: 1;
`;

const ActivityStatDivider = styled.View<{ $bg?: string; $opacity?: number }>`
  width: 1px;
  margin-horizontal: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  opacity: ${({ $opacity }) => $opacity ?? 1};
`;

const TxIcon = styled.View<{ $bg?: string }>`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  margin-top: 2px;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const SkeletonListRow = styled.View<{ $showBorder?: boolean }>`
  flex-direction: row;
  align-items: flex-start;
  padding-vertical: ${({ theme }) => theme.spacing.md};
  padding-horizontal: ${({ theme }) => theme.spacing.sm};
  gap: ${({ theme }) => theme.spacing.md};
  ${({ theme, $showBorder }) =>
    $showBorder
      ? `
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colors.border};
`
      : ""}
`;

const SkeletonRowBody = styled.View`
  flex: 1;
  min-width: 0;
  justify-content: center;
`;

const SkeletonRowRight = styled.View`
  margin-left: 4px;
`;

const SkeletonLine = styled.View<{
  $width?: number | string;
  $height?: number | string;
  $bg?: string;
  $marginBottom?: number;
}>`
  height: ${({ $height }) =>
    typeof $height === "string"
      ? $height
      : $height != null
        ? `${$height}px`
        : "14px"};
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ $bg }) => $bg ?? "rgba(0,0,0,0.08)"};
  ${({ $width }) =>
    $width != null
      ? `width: ${typeof $width === "string" ? $width : `${$width}px`};`
      : ""}
  ${({ $marginBottom }) =>
    $marginBottom != null ? `margin-bottom: ${$marginBottom}px;` : ""}
`;

export function HistorySkeleton() {
  const primaryColor = useThemeColor({}, "primary");
  const skeletonLineBg = useThemeColor({}, "surfaceSubtle");

  return (
    <Container edges={["top", "left", "right"]}>
      <ScrollContent>
        <Header>
          <HeaderLeft>
            <SkeletonLine $width={120} $marginBottom={4} $bg={skeletonLineBg} />
            <SkeletonLine $width={140} $height={28} $bg={skeletonLineBg} />
          </HeaderLeft>
        </Header>

        <ActivityCard $bg={primaryColor} $opacity={0.85}>
          <ActivityCardHeader>
            <SkeletonLine $width={100} $bg="rgba(255,255,255,0.3)" />
            <CalendarIconBox $bg="rgba(255,255,255,0.3)" />
          </ActivityCardHeader>
          <SkeletonLine
            $width={140}
            $height={28}
            $bg="rgba(255,255,255,0.4)"
            $marginBottom={Spacing.lg}
          />
          <ActivityStats>
            <ActivityStatBlock>
              <SkeletonLine
                $width={70}
                $height={14}
                $bg="rgba(255,255,255,0.3)"
                $marginBottom={4}
              />
              <SkeletonLine
                $width={60}
                $height={22}
                $bg="rgba(255,255,255,0.4)"
              />
            </ActivityStatBlock>
            <ActivityStatDivider $bg="rgba(255,255,255,0.3)" />
            <ActivityStatBlock>
              <SkeletonLine
                $width={80}
                $height={14}
                $bg="rgba(255,255,255,0.3)"
                $marginBottom={4}
              />
              <SkeletonLine
                $width={50}
                $height={22}
                $bg="rgba(255,255,255,0.4)"
              />
            </ActivityStatBlock>
          </ActivityStats>
        </ActivityCard>

        <SkeletonLine
          $width={160}
          $height={20}
          $marginBottom={Spacing.md}
          $bg={skeletonLineBg}
        />

        <SurfaceCard $padding={Spacing.sm}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonListRow key={i} $showBorder={i < 5}>
              <TxIcon $bg={skeletonLineBg} />
              <SkeletonRowBody>
                <SkeletonLine
                  $width="75%"
                  $height={16}
                  $marginBottom={6}
                  $bg={skeletonLineBg}
                />
                <SkeletonLine $width={100} $height={12} $bg={skeletonLineBg} />
              </SkeletonRowBody>
              <SkeletonRowRight>
                <SkeletonLine $width={50} $height={16} $bg={skeletonLineBg} />
              </SkeletonRowRight>
            </SkeletonListRow>
          ))}
        </SurfaceCard>
      </ScrollContent>
    </Container>
  );
}
