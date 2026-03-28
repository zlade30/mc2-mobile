import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import { Pressable } from "react-native";
import { styled, useTheme } from "styled-components/native";

import { ThemedText } from "@/shared/ui/themed-text";
import type { ColorScheme } from "@/shared/store";
import { useThemeStore } from "@/shared/store";

export type ThemeToggleVariant = "segmented" | "switch";

type ThemeToggleProps = {
  variant?: ThemeToggleVariant;
  label?: string;
};

const Wrapper = styled.View`
  margin-vertical: ${(p) => p.theme.spacing.sm};
`;

const LabelSpacer = styled.View`
  margin-bottom: ${(p) => p.theme.spacing.xs};
`;

const SegmentedRow = styled.View`
  flex-direction: row;
  border-radius: ${(p) => p.theme.radii.md};
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  background-color: ${(p) => p.theme.colors.surfaceElevated};
  padding: 4px;
`;

const SegmentTouchable = styled(Pressable)<{ $selected: boolean }>`
  flex: 1;
  border-radius: ${(p) => p.theme.radii.sm};
  background-color: ${(p) =>
    p.$selected ? p.theme.colors.primary : "transparent"};
`;

const SegmentInner = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-vertical: ${(p) => p.theme.spacing.sm};
  padding-horizontal: ${(p) => p.theme.spacing.md};
`;

const SwitchRow = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: ${(p) => p.theme.spacing.sm};
  padding-vertical: ${(p) => p.theme.spacing.md};
  padding-horizontal: ${(p) => p.theme.spacing.lg};
  border-radius: ${(p) => p.theme.radii.md};
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
  background-color: ${(p) => p.theme.colors.surfaceElevated};
`;

const SwitchLabelText = styled.Text`
  flex: 1;
  font-size: ${(p) => p.theme.typography.body}px;
  color: ${(p) => p.theme.colors.text};
  font-family: ${(p) => p.theme.typography.fontFamily.regular};
`;

export function ThemeToggle({
  variant = "segmented",
  label,
}: ThemeToggleProps) {
  const theme = useTheme();
  const colorScheme = useThemeStore((state) => state.colorScheme);
  const setColorScheme = useThemeStore((state) => state.setColorScheme);

  const options: {
    value: ColorScheme;
    label: string;
    icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  }[] = [
    { value: "light", label: "Light", icon: "white-balance-sunny" },
    { value: "dark", label: "Dark", icon: "moon-waning-crescent" },
  ];

  if (variant === "switch") {
    const isDark = colorScheme === "dark";
    const next: ColorScheme = isDark ? "light" : "dark";
    const nextOption = options.find((o) => o.value === next)!;
    return (
      <Wrapper>
        {label ? (
          <LabelSpacer>
            <ThemedText type="caption">{label}</ThemedText>
          </LabelSpacer>
        ) : null}
        <SwitchRow onPress={() => setColorScheme(next)}>
          <MaterialCommunityIcons
            name={nextOption.icon}
            size={22}
            color={theme.colors.text}
          />
          <SwitchLabelText>{nextOption.label} mode</SwitchLabelText>
          <ThemedText type="caption">Tap to switch</ThemedText>
        </SwitchRow>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {label ? (
        <LabelSpacer>
          <ThemedText type="caption">{label}</ThemedText>
        </LabelSpacer>
      ) : null}
      <SegmentedRow>
        {options.map((opt) => {
          const isSelected = colorScheme === opt.value;
          const iconColor = isSelected
            ? theme.colors.primaryFg
            : theme.colors.textSecondary;
          const textColor = isSelected
            ? theme.colors.primaryFg
            : theme.colors.textSecondary;
          return (
            <SegmentTouchable
              key={opt.value}
              $selected={isSelected}
              onPress={() => setColorScheme(opt.value)}
            >
              <SegmentInner>
                <MaterialCommunityIcons
                  name={opt.icon}
                  size={18}
                  color={iconColor}
                />
                <ThemedText
                  type={isSelected ? "defaultSemiBold" : "caption"}
                  lightColor={textColor}
                  darkColor={textColor}
                >
                  {opt.label}
                </ThemedText>
              </SegmentInner>
            </SegmentTouchable>
          );
        })}
      </SegmentedRow>
    </Wrapper>
  );
}
