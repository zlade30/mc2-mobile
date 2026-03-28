/**
 * Coffee-shop theme: espresso browns, latte cream, warm accents.
 */

import { Platform } from "react-native";

// Coffee palette (light)
const espresso = "#2D1B0E"; // dark roast
const coffeeBean = "#5C4033"; // medium roast
const latte = "#E8DDD4"; // latte
const cream = "#F5F0E8"; // steamed milk / cream
const primaryCoral = "#582510"; // coffee-with-cream accent (warmer)
const primaryCoralHover = "#C49564";
const brownDark = espresso;
const brownMuted = coffeeBean;
const placeholder = "#B8A99A";
const bgSage = "#F5F2ED"; // warm latte background
const bgWarm = cream;
const borderTan = latte;
const accentYellow = "#C8AD5E"; // honey / raw sugar (lighter)
const successGreen = "#6B8E6B"; // sage / mint (subtle)
const successGreenLight = "#A8C4A8";
const purpleAccent = "#B5A4E0";

// Dark mode: espresso base, cream text
const darkBg = "#1a1209";
const darkSurface = "#2a2218";
const darkSurfaceSubtle = "#2d2114";
const darkBorder = "#453a2a"; // visible border on dark surfaces (warm brown)
const darkSurfaceElevated = "#3d3225"; // icon circles, chips – visible on darkSurface
const darkText = "#F5F0E8";
const darkMuted = "#c4b5a0";

export const Colors = {
  light: {
    text: brownDark,
    textSecondary: brownMuted,
    background: bgSage,
    surface: "#ffffff",
    surfaceSubtle: bgWarm,
    surfaceElevated: bgWarm,
    border: borderTan,
    tint: primaryCoral,
    primary: primaryCoral,
    primaryHover: primaryCoralHover,
    primaryForeground: "#ffffff",
    icon: brownMuted,
    screenIcon: primaryCoral,
    tabIconDefault: placeholder,
    tabIconSelected: primaryCoral,
    card: "#ffffff",
    inputBorder: borderTan,
    inputBackground: "#ffffff",
    link: primaryCoral,
    accentYellow,
    successGreen,
    successGreenLight,
    purpleAccent,
    brownDark,
    placeholder,
  },
  dark: {
    text: darkText,
    textSecondary: darkMuted,
    background: darkBg,
    surface: darkSurface,
    surfaceSubtle: darkSurfaceSubtle,
    surfaceElevated: darkSurfaceElevated,
    border: darkBorder,
    tint: primaryCoral,
    primary: primaryCoral,
    primaryHover: primaryCoralHover,
    primaryForeground: darkText,
    icon: primaryCoralHover,
    screenIcon: primaryCoralHover,
    tabIconDefault: darkMuted,
    tabIconSelected: primaryCoralHover,
    card: darkSurface,
    inputBorder: darkBorder,
    inputBackground: darkSurface,
    link: primaryCoralHover,
    accentYellow,
    successGreen,
    successGreenLight,
    purpleAccent,
    brownDark,
    placeholder: darkMuted,
  },
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

/** Chunky shadow from sample-design (4px offset, brown tint) */
export const Shadows = {
  chunky: {
    shadowColor: brownDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 4,
  },
  chunkyHover: {
    shadowColor: brownDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 0,
    elevation: 6,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "Nunito",
    serif: "Georgia",
    rounded: "Nunito",
    mono: "Menlo",
  },
  default: {
    sans: "Nunito",
    serif: "serif",
    rounded: "Nunito",
    mono: "monospace",
  },
  web: {
    sans: "'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'Nunito', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});
