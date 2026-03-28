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
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-top: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
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

const HeaderDateRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const HeaderBottomRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const HeaderRightIcon = styled.View<{ $bg?: string }>`
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const ActivityCard = styled.View<{ $bg?: string; $opacity?: number }>`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.xxl};
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
`;

const LevelIconBox = styled.View<{ $bg?: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  align-items: center;
  justify-content: center;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const BalanceProgressRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.md};
`;

const CtaBox = styled.View<{ $bg?: string }>`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-vertical: ${({ theme }) => theme.spacing.sm};
  padding-horizontal: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const RewardsDetailsRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
  gap: 4px;
`;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CardHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const CardHeaderText = styled.View`
  flex: 1;
  min-width: 0;
`;

const CardHeaderAction = styled.View<{ $bg?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  margin-left: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const CardImage = styled.View<{ $bg?: string }>`
  width: 100%;
  min-height: 120px;
  aspect-ratio: 16/9;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const CardBody = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
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

export function HomeSkeleton() {
  const primaryColor = useThemeColor({}, "primary");
  const cardBg = useThemeColor({}, "surface");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const skeletonLineBg = useThemeColor({}, "surfaceSubtle");

  return (
    <Container edges={["top", "left", "right"]}>
      <ScrollContent>
        <Header>
          <HeaderLeft>
            <HeaderDateRow>
              <SkeletonLine $width={110} $height={12} $bg={skeletonLineBg} />
              <SkeletonLine $width={120} $height={12} $bg={skeletonLineBg} />
            </HeaderDateRow>
            <HeaderBottomRow>
              <SkeletonLine $width={170} $height={28} $bg={skeletonLineBg} />
              <HeaderRightIcon $bg={skeletonLineBg} />
            </HeaderBottomRow>
          </HeaderLeft>
        </Header>

        <ActivityCard $bg={primaryColor} $opacity={0.85}>
          <ActivityCardHeader>
            <SkeletonLine $width={100} $bg="rgba(255,255,255,0.3)" />
            <LevelIconBox $bg="rgba(255,255,255,0.3)" />
          </ActivityCardHeader>
          <BalanceProgressRow>
            <SkeletonLine
              $width={60}
              $height={28}
              $bg="rgba(255,255,255,0.4)"
            />
          </BalanceProgressRow>
          <CtaBox $bg="rgba(255, 255, 255, 0.25)">
            <SkeletonLine
              $width="80%"
              $height={12}
              $bg="rgba(255,255,255,0.45)"
              $marginBottom={6}
            />
            <SkeletonLine
              $width="60%"
              $height={12}
              $bg="rgba(255,255,255,0.45)"
            />
          </CtaBox>
          <RewardsDetailsRow>
            <SkeletonLine $width={120} $height={12} $bg="rgba(255,255,255,0.45)" />
            <SkeletonLine $width={16} $height={12} $bg="rgba(255,255,255,0.45)" />
          </RewardsDetailsRow>
        </ActivityCard>

        <SectionHeaderRow>
          <SkeletonLine
            $width={140}
            $height={20}
            $bg={skeletonLineBg}
            $marginBottom={Spacing.md}
          />
          <SkeletonLine
            $width={64}
            $height={12}
            $bg={skeletonLineBg}
            $marginBottom={Spacing.md}
          />
        </SectionHeaderRow>
        {[1, 2, 3].map((i) => (
          <SurfaceCard key={i} $padding={Spacing.xs}>
            <CardHeader>
              <CardHeaderText>
                <SkeletonLine
                  $width="72%"
                  $height={18}
                  $bg={skeletonLineBg}
                  $marginBottom={6}
                />
                <SkeletonLine $width="40%" $height={12} $bg={skeletonLineBg} />
              </CardHeaderText>
              <CardHeaderAction $bg={skeletonLineBg} />
            </CardHeader>
            <CardImage $bg={surfaceElevated} />
            <CardBody>
              <SkeletonLine
                $width="100%"
                $height={14}
                $bg={skeletonLineBg}
                $marginBottom={8}
              />
              <SkeletonLine
                $width="84%"
                $height={14}
                $bg={skeletonLineBg}
                $marginBottom={8}
              />
              <SkeletonLine $width="62%" $height={14} $bg={skeletonLineBg} />
            </CardBody>
          </SurfaceCard>
        ))}
      </ScrollContent>
    </Container>
  );
}
