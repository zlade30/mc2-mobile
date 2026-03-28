import React from "react";
import { TouchableOpacity } from "react-native";
import { styled } from "styled-components/native";

import { ThemedText } from "@/shared/ui/themed-text";

const StyledListRow = styled(TouchableOpacity)<{ $showBorder?: boolean }>`
  flex-direction: row;
  align-items: flex-start;
  padding-vertical: ${(p) => p.theme.spacing.md};
  padding-horizontal: ${(p) => p.theme.spacing.sm};
  gap: ${(p) => p.theme.spacing.md};
  ${(p) =>
    p.$showBorder
      ? `
    border-bottom-width: 1px;
    border-bottom-color: ${p.theme.colors.border};
  `
      : ""}
`;

const ListRowLeft = styled.View`
  align-items: center;
  justify-content: center;
`;

const ListRowBody = styled.View`
  flex: 1;
  min-width: 0;
`;

const TitleText = styled(ThemedText)`
  margin-bottom: 2px;
`;

const ListRowRight = styled.View`
  margin-left: 4px;
`;

export type ListRowProps = {
  onPress?: () => void;
  left?: React.ReactNode;
  title: string;
  numberOfLines?: number;
  subtitle?: string;
  right?: React.ReactNode;
  showBorder?: boolean;
  activeOpacity?: number;
};

export function ListRow({
  onPress,
  left,
  title,
  subtitle,
  right,
  numberOfLines = 1,
  showBorder = false,
  activeOpacity = 0.8,
}: ListRowProps) {
  return (
    <StyledListRow
      onPress={onPress}
      activeOpacity={activeOpacity}
      $showBorder={showBorder}
    >
      {left ? <ListRowLeft>{left}</ListRowLeft> : null}
      <ListRowBody>
        <TitleText type="defaultSemiBold" numberOfLines={numberOfLines}>
          {title}
        </TitleText>
        {subtitle != null && subtitle !== "" ? (
          <ThemedText type="caption" numberOfLines={2}>
            {subtitle}
          </ThemedText>
        ) : null}
      </ListRowBody>
      {right ? <ListRowRight>{right}</ListRowRight> : null}
    </StyledListRow>
  );
}
