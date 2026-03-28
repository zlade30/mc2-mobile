import React from "react";
import { styled } from "styled-components/native";

import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { Spacing } from "@/shared/theme";
import { SurfaceCard } from "@/shared/ui/card";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-vertical: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const ScrollContent = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const ListRowSkeleton = styled.View<{ $showBorder?: boolean }>`
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

const RowIcon = styled.View<{ $bg?: string }>`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  margin-top: 2px;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const TxMiddle = styled.View`
  flex: 1;
  justify-content: center;
  min-width: 0;
`;

const SkeletonLine = styled.View<{
  $width?: number | string;
  $height?: number | string;
  $bg?: string;
  $marginBottom?: number;
  $borderRadius?: number;
}>`
  border-radius: ${({ $borderRadius, theme }) =>
    $borderRadius != null ? `${$borderRadius}px` : theme.radii.sm};
  height: ${({ $height }) =>
    typeof $height === "string"
      ? $height
      : $height != null
        ? `${$height}px`
        : "14px"};
  ${({ $width }) =>
    $width != null
      ? `width: ${typeof $width === "string" ? $width : `${$width}px`};`
      : ""}
  ${({ $bg }) => ($bg != null ? `background-color: ${$bg};` : "")}
  ${({ $marginBottom }) =>
    $marginBottom != null ? `margin-bottom: ${$marginBottom}px;` : ""}
`;

export function RewardsHistorySkeleton() {
  const skeletonLineBg = useThemeColor({}, "surfaceSubtle");

  return (
    <Container>
      <HeaderRow>
        <SkeletonLine
          $width={40}
          $height={40}
          $bg={skeletonLineBg}
          $borderRadius={20}
        />
        <HeaderLeft>
          <SkeletonLine
            $width={160}
            $height={22}
            $marginBottom={4}
            $bg={skeletonLineBg}
          />
          <SkeletonLine $width={100} $height={14} $bg={skeletonLineBg} />
        </HeaderLeft>
      </HeaderRow>

      <ScrollContent>
        <SkeletonLine
          $width={140}
          $height={20}
          $marginBottom={Spacing.md}
          $bg={skeletonLineBg}
        />
        <SurfaceCard $padding={Spacing.sm}>
          {[1, 2, 3, 4, 5].map((i) => (
            <ListRowSkeleton key={i} $showBorder={i < 5}>
              <RowIcon $bg={skeletonLineBg} />
              <TxMiddle>
                <SkeletonLine
                  $width="70%"
                  $height={16}
                  $bg={skeletonLineBg}
                  $marginBottom={6}
                />
                <SkeletonLine $width="82%" $height={12} $bg={skeletonLineBg} />
              </TxMiddle>
            </ListRowSkeleton>
          ))}
        </SurfaceCard>
      </ScrollContent>
    </Container>
  );
}
