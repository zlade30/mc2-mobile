/**
 * Design tokens for styled-components ThemeProvider.
 * Built from existing coffee-shop constants; never hardcode colors/spacing in components.
 */

import { Colors, BorderRadius } from "./colors";
import { Spacing } from "./spacing";

export { Colors, BorderRadius, Shadows, Fonts } from "./colors";
export { Spacing } from "./spacing";

export const lightTheme = {
  colors: {
    ...Colors.light,
    primaryFg: Colors.light.primaryForeground,
    error: "#b91c1c",
  },
  spacing: {
    xs: `${Spacing.xs}px`,
    sm: `${Spacing.sm}px`,
    md: `${Spacing.md}px`,
    lg: `${Spacing.lg}px`,
    xl: `${Spacing.xl}px`,
    xxl: `${Spacing.xxl}px`,
    xxxl: `${Spacing.xxxl}px`,
  },
  typography: {
    body: 16,
    bodyLineHeight: 24,
    subtitle: 17,
    subtitleLineHeight: 22,
    title: 28,
    titleLineHeight: 34,
    heading: 28,
    caption: 13,
    captionLineHeight: 18,
    fontFamily: {
      regular: "Nunito_400Regular",
      medium: "Nunito_500Medium",
      semiBold: "Nunito_600SemiBold",
      bold: "Nunito_700Bold",
      extraBold: "Nunito_800ExtraBold",
    },
  },
  radii: {
    sm: `${BorderRadius.sm}px`,
    md: `${BorderRadius.md}px`,
    lg: `${BorderRadius.lg}px`,
    xl: `${BorderRadius.xl}px`,
    xxl: `${BorderRadius.xxl}px`,
    full: `${BorderRadius.full}px`,
  },
} as const;

export const darkTheme = {
  ...lightTheme,
  colors: {
    ...Colors.dark,
    primaryFg: Colors.dark.primaryForeground,
    error: "#b91c1c",
  },
} as const;

export type AppTheme = typeof lightTheme;
