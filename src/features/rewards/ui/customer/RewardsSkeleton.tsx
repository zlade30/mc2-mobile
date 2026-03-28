import React from "react";
import { Platform } from "react-native";
import { styled } from "styled-components/native";

import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { BorderRadius, Shadows, Spacing } from "@/shared/theme";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const ScrollContent = styled.View`
  padding-horizontal: ${(p) => p.theme.spacing.xxl};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${(p) => p.theme.spacing.lg};
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const ActivityCard = styled.View<{ $bg?: string; $opacity?: number }>`
  margin-bottom: ${(p) => p.theme.spacing.xxl};
  padding: ${(p) => p.theme.spacing.xl};
  border-radius: ${BorderRadius.xxl}px;
  padding-vertical: ${(p) => p.theme.spacing.xxl};
  background-color: ${(p) => p.$bg ?? p.theme.colors.surface};
  opacity: ${(p) => p.$opacity ?? 1};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : `elevation: ${Shadows.chunky.elevation};`}
`;

const ActivityCardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(p) => p.theme.spacing.sm};
`;

const CalendarIconBox = styled.View<{ $bg?: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${BorderRadius.sm}px;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => p.$bg ?? "transparent"};
`;

const ActivityStats = styled.View`
  flex-direction: row;
  align-items: stretch;
`;

const ActivityStatBlock = styled.View`
  flex: 1;
`;

const ActivityStatDivider = styled.View<{ $bg?: string }>`
  width: 1px;
  margin-horizontal: ${(p) => p.theme.spacing.lg};
  background-color: ${(p) => p.$bg ?? p.theme.colors.border};
`;

const TxCard = styled.View<{ $bg?: string; $opacity?: number }>`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${(p) => p.theme.spacing.md};
  padding-vertical: ${(p) => p.theme.spacing.lg};
  padding-horizontal: ${(p) => p.theme.spacing.xl};
  border-radius: ${BorderRadius.xl}px;
  background-color: ${(p) => p.$bg ?? p.theme.colors.surface};
  opacity: ${(p) => p.$opacity ?? 1};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : `elevation: ${Shadows.chunky.elevation};`}
`;

const NoteCard = styled.View<{ $bg?: string }>`
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const TxIconCircle = styled.View<{ $bg?: string; $size?: number }>`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  margin-right: ${(p) => p.theme.spacing.md};
  background-color: ${(p) => p.$bg ?? p.theme.colors.surface};
  ${({ $size }) =>
    $size != null
      ? `width: ${$size}px; height: ${$size}px; border-radius: ${$size / 2}px;`
      : ""}
`;

const TxMiddle = styled.View`
  flex: 1;
  justify-content: center;
  min-width: 0;
`;

const SectionTitleRow = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ClaimButtonPlaceholder = styled.View<{ $bg?: string }>`
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-vertical: 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  align-items: center;
`;

const ViewHistoryRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-vertical: ${({ theme }) => theme.spacing.xl};
`;

const SkeletonLine = styled.View<{
  $width?: number | string;
  $height?: number | string;
  $bg?: string;
  $marginBottom?: number;
}>`
  border-radius: ${BorderRadius.sm}px;
  width: ${(p) =>
    p.$width != null
      ? typeof p.$width === "number"
        ? `${p.$width}px`
        : p.$width
      : "auto"};
  height: ${(p) =>
    p.$height != null
      ? typeof p.$height === "number"
        ? `${p.$height}px`
        : p.$height
      : "auto"};
  background-color: ${(p) => p.$bg ?? "transparent"};
  margin-bottom: ${(p) => p.$marginBottom ?? 0}px;
`;

export function RewardsSkeleton() {
  const skeletonLineBg = useThemeColor({}, "surfaceSubtle");
  const primaryColor = useThemeColor({}, "primary");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");

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
                $width={40}
                $height={22}
                $bg="rgba(255,255,255,0.4)"
              />
            </ActivityStatBlock>
            <ActivityStatDivider $bg="rgba(255,255,255,0.2)" />
            <ActivityStatBlock>
              <SkeletonLine
                $width={80}
                $height={14}
                $bg="rgba(255,255,255,0.3)"
                $marginBottom={4}
              />
              <SkeletonLine
                $width={40}
                $height={22}
                $bg="rgba(255,255,255,0.4)"
              />
            </ActivityStatBlock>
          </ActivityStats>
        </ActivityCard>

        <SkeletonLine
          $width={160}
          $height={20}
          $bg={skeletonLineBg}
          $marginBottom={Spacing.md}
        />
        <NoteCard $bg={surfaceElevated}>
          <TxIconCircle $bg={skeletonLineBg} $size={20} />
          <TxMiddle>
            <SkeletonLine
              $width="100%"
              $height={12}
              $bg={skeletonLineBg}
              $marginBottom={6}
            />
            <SkeletonLine $width="70%" $height={12} $bg={skeletonLineBg} />
          </TxMiddle>
        </NoteCard>

        <SectionTitleRow>
          <SkeletonLine $width={150} $height={20} $bg={skeletonLineBg} />
        </SectionTitleRow>
        <TxCard $bg={skeletonLineBg} $opacity={0.6}>
          <TxIconCircle $bg={skeletonLineBg} />
          <TxMiddle>
            <SkeletonLine
              $width="70%"
              $height={16}
              $bg={skeletonLineBg}
              $marginBottom={6}
            />
            <SkeletonLine $width="50%" $height={12} $bg={skeletonLineBg} />
            <ClaimButtonPlaceholder $bg="rgba(0,0,0,0.08)">
              <SkeletonLine
                $width={120}
                $height={12}
                $bg="rgba(0,0,0,0.12)"
              />
            </ClaimButtonPlaceholder>
          </TxMiddle>
        </TxCard>
        <ViewHistoryRow>
          <SkeletonLine $width={130} $height={12} $bg={skeletonLineBg} />
          <SkeletonLine $width={12} $height={12} $bg={skeletonLineBg} />
        </ViewHistoryRow>
      </ScrollContent>
    </Container>
  );
}
