import React from "react";
import { Platform, type ViewProps } from "react-native";
import { styled } from "styled-components/native";
import { Shadows } from "../theme";

export type CardProps = ViewProps & {
  padded?: boolean;
};

const StyledCard = styled.View<{ $padded: boolean }>`
  border-radius: ${(p) => p.theme.radii.lg};
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  border-left-width: 4px;
  border-left-color: ${(p) => p.theme.colors.primary};
  background-color: ${(p) => p.theme.colors.card};
  ${(p) => p.$padded && `padding: ${p.theme.spacing.xl};`}
`;

export function Card({ style, padded = true, ...rest }: CardProps) {
  return <StyledCard $padded={padded} style={style} {...rest} />;
}

export const SurfaceCard = styled.View<{
  $bg?: string;
  $borderColor?: string;
  $borderWidth?: number;
  $padding?: number;
  $marginBottom?: number;
}>`
  border-radius: ${({ theme }) => theme.radii.xl};
  margin-bottom: ${({ theme, $marginBottom }) =>
    $marginBottom ? `${$marginBottom}px` : theme.spacing.md};
  padding: ${({ theme, $padding }) =>
    $padding ? `${$padding}px` : theme.spacing.xl};
  background-color: ${({ theme, $bg }) => $bg ?? theme.colors.surface};
  border-width: ${({ $borderWidth }) => $borderWidth ?? 1}px;
  border-color: ${({ theme, $borderColor }) =>
    $borderColor ?? theme.colors.border};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : "elevation: 3;"};
`;
