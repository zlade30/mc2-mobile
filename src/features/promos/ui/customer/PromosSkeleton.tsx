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

const HeaderRight = styled.View`
  align-items: flex-end;
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

const TabBar = styled.View`
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.lg};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const TabButton = styled.View<{ $active?: boolean; $bg?: string }>`
  flex: 1;
  padding-vertical: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center;
  justify-content: center;
  background-color: ${({ $active, $bg }) => ($active ? ($bg ?? "transparent") : "transparent")};
`;

const PostHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PostHeaderText = styled.View`
  flex: 1;
  min-width: 0;
`;

const PostHeaderAction = styled.View<{ $bg?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  margin-left: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const PostImageWrap = styled.View<{ $bg?: string }>`
  width: 100%;
  min-height: 120px;
  aspect-ratio: 16/9;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const PostBody = styled.View`
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

export function PromosSkeleton() {
  const tabActiveBg = useThemeColor({}, "primary");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const primaryColor = useThemeColor({}, "primary");
  const skeletonLineBg = useThemeColor({}, "surfaceSubtle");

  return (
    <Container edges={["top", "left", "right"]}>
      <ScrollContent>
        <Header>
          <HeaderLeft>
            <SkeletonLine $width={120} $marginBottom={4} $bg={skeletonLineBg} />
            <SkeletonLine $width={80} $height={28} $bg={skeletonLineBg} />
          </HeaderLeft>
          <HeaderRight>
            <HeaderRightIcon $bg={skeletonLineBg} />
          </HeaderRight>
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
          </ActivityStats>
        </ActivityCard>

        <SkeletonLine
          $width={140}
          $height={20}
          $marginBottom={Spacing.md}
          $bg={skeletonLineBg}
        />

        <TabBar>
          <TabButton $active $bg={tabActiveBg}>
            <SkeletonLine
              $width={70}
              $height={14}
              $bg="rgba(255,255,255,0.5)"
            />
          </TabButton>
          <TabButton>
            <SkeletonLine $width={100} $height={14} $bg={skeletonLineBg} />
          </TabButton>
        </TabBar>

        <SkeletonLine
          $width={130}
          $height={20}
          $marginBottom={Spacing.md}
          $bg={skeletonLineBg}
        />

        {[1, 2, 3].map((i) => (
          <SurfaceCard key={i} $padding={Spacing.xs}>
            <PostHeader>
              <PostHeaderText>
                <SkeletonLine
                  $width="70%"
                  $height={18}
                  $marginBottom={6}
                  $bg={skeletonLineBg}
                />
                <SkeletonLine $width={50} $height={12} $bg={skeletonLineBg} />
              </PostHeaderText>
              <PostHeaderAction $bg={skeletonLineBg} />
            </PostHeader>
            <PostImageWrap $bg={surfaceElevated} />
            <PostBody>
              <SkeletonLine
                $width="100%"
                $height={14}
                $marginBottom={8}
                $bg={skeletonLineBg}
              />
              <SkeletonLine
                $width="85%"
                $height={14}
                $marginBottom={8}
                $bg={skeletonLineBg}
              />
              <SkeletonLine $width="60%" $height={14} $bg={skeletonLineBg} />
            </PostBody>
          </SurfaceCard>
        ))}
      </ScrollContent>
    </Container>
  );
}
