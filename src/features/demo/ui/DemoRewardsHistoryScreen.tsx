import { MOCK_CUSTOMER_REWARDS } from "@/shared/lib/demo-data";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { Shadows, Spacing } from "@/shared/theme";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { Gift } from "@solar-icons/react-native/Broken";
import React from "react";
import { Platform } from "react-native";
import { styled } from "styled-components/native";

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

const PageTitle = styled(ThemedText)`
  margin-top: 0;
  margin-bottom: 2px;
`;

const Scroll = styled(ScrollViewWithRefresh)`
  flex: 1;
`;

const ScrollContent = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const TxCard = styled.View<{ $bg?: string }>`
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-vertical: ${({ theme }) => theme.spacing.lg};
  padding-horizontal: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.xl};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : "elevation: 3;"}
`;

const TxMiddle = styled.View`
  flex: 1;
  justify-content: center;
  min-width: 0;
`;

const TxItemName = styled(ThemedText)`
  margin-bottom: 2px;
`;

const StatusBadgeRow = styled.View`
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 2px;
  gap: 6px;
`;

const DateText = styled(ThemedText)<{ $color?: string }>`
  margin-top: 4px;
  font-size: 11px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const EmptyState = styled.View`
  align-items: center;
  justify-content: center;
  padding-vertical: 48px;
`;

const EmptyIcon = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyCaption = styled(ThemedText)<{ $color?: string }>`
  margin-top: ${({ theme }) => theme.spacing.xs};
  text-align: center;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

function formatDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DemoRewardsHistoryScreen() {
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const cardBg = useThemeColor({}, "surface");

  const history = MOCK_CUSTOMER_REWARDS.history ?? [];

  return (
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Rewards History</PageTitle>
          <ThemedText type="caption" style={{ color: textMuted }}>
            Expired and claimed rewards will appear here.
          </ThemedText>
        </HeaderLeft>
      </HeaderRow>

      <Scroll showsVerticalScrollIndicator={false} onRefresh={async () => {}}>
        <ScrollContent>
          {history.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <Gift size={60} color={textMuted} />
              </EmptyIcon>
              <ThemedText type="subtitle" style={{ color: textMuted }}>
                No rewards yet
              </ThemedText>
              <EmptyCaption type="caption" $color={textMuted}>
                Your earned rewards will appear here.
              </EmptyCaption>
            </EmptyState>
          ) : (
            history.map((item) => (
              <TxCard key={item.id} $bg={cardBg}>
                <Gift
                  size={22}
                  color={screenIconColor}
                  style={{ marginRight: Spacing.md }}
                />
                <TxMiddle>
                  <TxItemName type="defaultSemiBold" numberOfLines={1}>
                    {item.reward_rule.reward_title}
                  </TxItemName>
                  <ThemedText
                    type="caption"
                    style={{ color: textMuted }}
                    numberOfLines={1}
                  >
                    {item.reward_rule.name}
                  </ThemedText>
                  <StatusBadgeRow>
                    <DateText type="caption" $color={textMuted}>
                      {item.status === "claimed" &&
                        item.claimed_at &&
                        `Claimed ${formatDate(item.claimed_at)}`}
                      {item.status === "expired" &&
                        item.expires_at &&
                        `Expired ${formatDate(item.expires_at)}`}
                    </DateText>
                  </StatusBadgeRow>
                </TxMiddle>
              </TxCard>
            ))
          )}
        </ScrollContent>
      </Scroll>
    </Container>
  );
}
