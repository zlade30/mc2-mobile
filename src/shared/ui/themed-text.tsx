import React from "react";
import { type TextProps } from "react-native";
import { styled } from "styled-components/native";

import { useThemeStore } from "@/shared/store";

const font = (p: {
  theme: { typography: { fontFamily: Record<string, string> } };
}) => p.theme.typography.fontFamily;

type TextType =
  | "default"
  | "title"
  | "defaultSemiBold"
  | "subtitle"
  | "link"
  | "caption";

const StyledText = styled.Text<{
  $type: TextType;
  $color?: string;
}>`
  color: ${(p) =>
    p.$color ??
    (p.$type === "link"
      ? p.theme.colors.link
      : p.$type === "caption"
        ? p.theme.colors.textSecondary
        : p.theme.colors.text)};
  font-family: ${(p) =>
    p.$type === "title"
      ? font(p).extraBold
      : p.$type === "defaultSemiBold" || p.$type === "subtitle"
        ? font(p).semiBold
        : p.$type === "link"
          ? font(p).medium
          : font(p).regular};
  font-size: ${(p) =>
    p.$type === "title"
      ? p.theme.typography.title
      : p.$type === "subtitle"
        ? p.theme.typography.subtitle
        : p.$type === "caption"
          ? p.theme.typography.caption
          : p.theme.typography.body}px;
  line-height: ${(p) =>
    p.$type === "title"
      ? p.theme.typography.titleLineHeight
      : p.$type === "subtitle"
        ? p.theme.typography.subtitleLineHeight
        : p.$type === "caption"
          ? p.theme.typography.captionLineHeight
          : p.theme.typography.bodyLineHeight}px;
  ${(p) => p.$type === "title" && "letter-spacing: -0.5px;"}
  ${(p) => p.$type === "caption" && "opacity: 0.9;"}
`;

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: TextType;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const resolvedColor =
    colorScheme === "dark"
      ? (darkColor ?? lightColor)
      : (lightColor ?? darkColor);

  return (
    <StyledText $type={type} $color={resolvedColor} style={style} {...rest} />
  );
}
