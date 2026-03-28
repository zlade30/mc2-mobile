import React from "react";
import { styled } from "styled-components/native";

import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { SurfaceCard } from "@/shared/ui/card";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const ScrollContent = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
`;

const Header = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const HeaderTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const QrCard = styled.View<{ $bg?: string; $opacity?: number }>`
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  align-items: center;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  opacity: ${({ $opacity }) => $opacity ?? 1};
`;

const QrWrapper = styled.View<{ $bg?: string }>`
  background-color: ${({ $bg }) => $bg ?? "#fff"};
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const QrPlaceholder = styled.View`
  width: 200px;
  height: 200px;
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

const SignOutButton = styled.View<{ $bg?: string }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-vertical: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const SkeletonLine = styled.View<{
  $width?: number | string;
  $height?: number | string;
  $bg?: string;
  $marginBottom?: number;
  $marginTop?: number;
  $borderRadius?: number;
}>`
  height: ${({ $height }) =>
    typeof $height === "string"
      ? $height
      : $height != null
        ? `${$height}px`
        : "14px"};
  border-radius: ${({ $borderRadius, theme }) =>
    $borderRadius != null ? `${$borderRadius}px` : theme.radii.sm};
  background-color: ${({ $bg }) => $bg ?? "rgba(0,0,0,0.08)"};
  ${({ $width }) =>
    $width != null
      ? `width: ${typeof $width === "string" ? $width : `${$width}px`};`
      : ""}
  ${({ $marginBottom }) =>
    $marginBottom != null ? `margin-bottom: ${$marginBottom}px;` : ""}
  ${({ $marginTop }) =>
    $marginTop != null ? `margin-top: ${$marginTop}px;` : ""}
`;

export function ProfileSkeleton() {
  const primaryColor = useThemeColor({}, "primary");
  const surfaceColor = useThemeColor({}, "surface");
  const skeletonLineBg = useThemeColor({}, "surfaceSubtle");

  return (
    <Container edges={["top", "left", "right"]}>
      <ScrollContent>
        <Header>
          <HeaderTop>
            <SkeletonLine $width={140} $height={12} $bg={skeletonLineBg} />
          </HeaderTop>
          <SkeletonLine
            $width={100}
            $height={28}
            $bg={skeletonLineBg}
            $marginTop={4}
          />
        </Header>

        <SkeletonLine
          $width={80}
          $height={18}
          $marginBottom={8}
          $bg={skeletonLineBg}
        />
        <SurfaceCard $bg={surfaceColor}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonListRow key={i} $showBorder={i < 8}>
              <SkeletonLine $width={24} $height={24} $bg={skeletonLineBg} />
              <SkeletonRowBody>
                <SkeletonLine $width={90} $height={14} $bg={skeletonLineBg} />
                {i === 1 || i >= 5 ? (
                  <SkeletonLine
                    $width={140}
                    $height={12}
                    $marginTop={4}
                    $bg={skeletonLineBg}
                  />
                ) : null}
              </SkeletonRowBody>
              {i === 5 ? (
                <SkeletonLine
                  $width={38}
                  $height={20}
                  $borderRadius={10}
                  $bg={skeletonLineBg}
                />
              ) : (
                <SkeletonLine $width={40} $height={14} $bg={skeletonLineBg} />
              )}
            </SkeletonListRow>
          ))}
        </SurfaceCard>

        <QrCard $bg={primaryColor} $opacity={0.9}>
          <SkeletonLine
            $width={140}
            $height={12}
            $bg="rgba(255,255,255,0.4)"
            $marginBottom={4}
          />
          <SkeletonLine
            $width="100%"
            $height={14}
            $bg="rgba(255,255,255,0.3)"
            $marginBottom={8}
          />
          <SkeletonLine
            $width={120}
            $height={18}
            $bg="rgba(255,255,255,0.4)"
            $marginBottom={24}
          />
          <QrWrapper $bg="rgba(255,255,255,0.2)">
            <QrPlaceholder />
          </QrWrapper>
        </QrCard>

        <SurfaceCard $bg={surfaceColor}>
          <SkeletonLine
            $width={100}
            $height={18}
            $marginBottom={8}
            $bg={skeletonLineBg}
          />
          <SkeletonLine
            $width="100%"
            $height={40}
            $bg={skeletonLineBg}
            $borderRadius={12}
          />
        </SurfaceCard>
        <SignOutButton $bg={primaryColor}>
          <SkeletonLine $width={70} $height={16} $bg="rgba(255,255,255,0.6)" />
        </SignOutButton>
      </ScrollContent>
    </Container>
  );
}
