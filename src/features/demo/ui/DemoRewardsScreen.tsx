import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { MOCK_CUSTOMER_REWARDS } from "@/shared/lib/demo-data";
import { getFormattedDate } from "@/shared/lib/utils";
import { BorderRadius, Shadows, Spacing } from "@/shared/theme";
import { LinkButton } from "@/shared/ui/button";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Gift as GiftBold } from "@solar-icons/react-native/Bold";
import { Gift, QrCode } from "@solar-icons/react-native/Broken";
import { useRouter } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { css, styled } from "styled-components/native";

const chunkyShadow =
  Platform.OS === "ios"
    ? css`
        shadow-color: ${Shadows.chunky.shadowColor};
        shadow-offset: ${Shadows.chunky.shadowOffset.width}px
          ${Shadows.chunky.shadowOffset.height}px;
        shadow-opacity: ${Shadows.chunky.shadowOpacity};
        shadow-radius: ${Shadows.chunky.shadowRadius}px;
      `
    : css`
        elevation: ${Shadows.chunky.elevation};
      `;

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const Scroll = styled(ScrollViewWithRefresh)`
  flex: 1;
`;

const ScrollContent = styled.View`
  padding-horizontal: ${(p) => p.theme.spacing.xxl};
`;

const DailyLimitNote = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${(p) => p.theme.spacing.sm};
  margin-bottom: ${(p) => p.theme.spacing.lg};
  padding: ${(p) => p.theme.spacing.md};
  border-radius: ${BorderRadius.md}px;
  background-color: ${(p) => p.theme.colors.surfaceElevated};
  border-width: 1px;
  border-color: ${(p) => p.theme.colors.border};
`;

const DailyLimitNoteText = styled(ThemedText).attrs({ type: "caption" })`
  flex: 1;
  line-height: 20px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${(p) => p.theme.spacing.lg};
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const DateText = styled(ThemedText).attrs({ type: "caption" })<{
  $color?: string;
}>`
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  color: ${(p) => p.$color ?? p.theme.colors.text};
`;

const PageTitle = styled(ThemedText).attrs({ type: "title" })`
  margin-top: 0;
`;

const ActivityCard = styled.View<{ $bg?: string; $opacity?: number }>`
  margin-bottom: ${(p) => p.theme.spacing.xxl};
  padding: ${(p) => p.theme.spacing.xl};
  border-radius: ${BorderRadius.xxl}px;
  padding-vertical: ${(p) => p.theme.spacing.xxl};
  background-color: ${(p) => p.$bg ?? p.theme.colors.surface};
  opacity: ${(p) => p.$opacity ?? 1};
  ${chunkyShadow}
`;

const ActivityCardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${(p) => p.theme.spacing.sm};
`;

const ActivityLabel = styled(ThemedText).attrs({ type: "caption" })<{
  $color?: string;
}>`
  font-size: 11px;
  letter-spacing: 0.5px;
  color: ${(p) => p.$color ?? p.theme.colors.text};
`;

const CalendarIconBox = styled.View<{ $bg?: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${BorderRadius.sm}px;
  align-items: center;
  justify-content: center;
  background-color: ${(p) => p.$bg ?? "transparent"};
`;

const ActivityTitle = styled(ThemedText)<{ $color?: string }>`
  font-size: 22px;
  line-height: 28px;
  font-family: ${(p) => p.theme.typography.fontFamily.extraBold};
  margin-bottom: ${(p) => p.theme.spacing.lg};
  color: ${(p) => p.$color ?? p.theme.colors.text};
`;

const ActivityStats = styled.View`
  flex-direction: row;
  align-items: stretch;
`;

const ActivityStatBlock = styled.View`
  flex: 1;
`;

const ActivityStatLabel = styled(ThemedText).attrs({ type: "caption" })<{
  $color?: string;
  $opacity?: number;
}>`
  margin-bottom: 4px;
  color: ${(p) => p.$color ?? p.theme.colors.text};
  opacity: ${(p) => p.$opacity ?? 1};
`;

const ActivityStatValue = styled(ThemedText)<{ $color?: string }>`
  font-size: 20px;
  line-height: 26px;
  font-family: ${(p) => p.theme.typography.fontFamily.extraBold};
  color: ${(p) => p.$color ?? p.theme.colors.text};
`;

const PointsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const RedeemCard = styled.View<{ $bg?: string }>`
  flex-direction: column;
  align-items: stretch;
  margin-bottom: ${(p) => p.theme.spacing.md};
  padding-vertical: ${(p) => p.theme.spacing.lg};
  padding-horizontal: ${(p) => p.theme.spacing.xl};
  border-radius: ${BorderRadius.xl}px;
  background-color: ${(p) => p.$bg ?? p.theme.colors.surface};
  ${chunkyShadow}
`;

const RedeemCardTopRow = styled.View`
  flex-direction: row;
  margin-bottom: ${(p) => p.theme.spacing.md};
`;

const TxMiddle = styled.View`
  flex: 1;
  justify-content: center;
  min-width: 0;
`;

const TxItemName = styled(ThemedText).attrs({ type: "defaultSemiBold" })`
  margin-bottom: 2px;
`;

const TxCaption = styled(ThemedText).attrs({ type: "caption" })<{
  $color?: string;
}>`
  margin-bottom: 2px;
  color: ${(p) => p.$color ?? p.theme.colors.text};
`;

const EligibleBadge = styled(ThemedText).attrs({ type: "caption" })<{
  $color?: string;
}>`
  margin-top: 2px;
  font-size: 11px;
  color: ${(p) => p.$color ?? p.theme.colors.text};
`;

const ClaimButton = styled.View<{ $borderColor?: string; $bg?: string }>`
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-vertical: 8px;
  padding-horizontal: ${(p) => p.theme.spacing.md};
  border-width: 1px;
  border-radius: ${BorderRadius.sm}px;
  margin-top: ${(p) => p.theme.spacing.md};
  align-self: flex-start;
  border-color: ${(p) => p.$borderColor ?? p.theme.colors.border};
  background-color: ${(p) => p.$bg ?? "transparent"};
`;

const ClaimButtonText = styled(ThemedText).attrs({ type: "defaultSemiBold" })<{
  $color?: string;
}>`
  font-size: 13px;
  color: ${(p) => p.$color ?? p.theme.colors.text};
`;

const ViewOlderRow = styled(LinkButton)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding-vertical: ${(p) => p.theme.spacing.xl};
`;

const ViewOlderText = styled(ThemedText).attrs({ type: "caption" })<{
  $color?: string;
}>`
  color: ${(p) => p.$color ?? p.theme.colors.textSecondary};
`;

export function DemoRewardsScreen() {
  const router = useRouter();
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const accentYellow = useThemeColor({}, "accentYellow");
  const claimButtonColor = useThemeColor({ dark: accentYellow }, "primary");
  const iconOnAccent = useThemeColor({}, "brownDark");
  const cardBg = useThemeColor({}, "surface");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  const claimable = MOCK_CUSTOMER_REWARDS.redeemable ?? [];

  return (
    <Container edges={["top", "left", "right"]}>
      <Scroll
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        onRefresh={async () => {}}
      >
        <ScrollContent>
          <Header>
            <HeaderLeft>
              <DateText $color={textMuted}>{getFormattedDate()}</DateText>
              <PageTitle>Rewards</PageTitle>
            </HeaderLeft>
          </Header>

          <ActivityCard $bg={primaryColor}>
            <ActivityCardHeader>
              <ActivityLabel $color={accentYellow}>YOUR REWARDS</ActivityLabel>
              <CalendarIconBox $bg={accentYellow}>
                <Gift size={18} color={iconOnAccent} />
              </CalendarIconBox>
            </ActivityCardHeader>
            <ActivityTitle $color={cardOnDarkText}>
              Earn with your visits
            </ActivityTitle>
            <ActivityStats>
              <ActivityStatBlock>
                <ActivityStatLabel $color={cardOnDarkText} $opacity={0.9}>
                  Claimable Rewards
                </ActivityStatLabel>
                <PointsRow>
                  <GiftBold size={18} color={accentYellow} />
                  <ActivityStatValue $color={accentYellow}>
                    {claimable.length}
                  </ActivityStatValue>
                </PointsRow>
              </ActivityStatBlock>
            </ActivityStats>
          </ActivityCard>

          <DailyLimitNote>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={textMuted}
            />
            <DailyLimitNoteText>
              You can only claim one reward per day.
            </DailyLimitNoteText>
          </DailyLimitNote>

          {claimable.length > 0 &&
            claimable.map((item) => (
              <RedeemCard key={item.id} $bg={cardBg}>
                <RedeemCardTopRow>
                  <Gift
                    size={22}
                    color={screenIconColor}
                    style={{ marginRight: Spacing.md }}
                  />
                  <TxMiddle>
                    <TxItemName numberOfLines={1}>
                      {item.reward_title}
                    </TxItemName>
                    <TxCaption $color={textMuted} numberOfLines={1}>
                      {item.name}
                    </TxCaption>
                    <EligibleBadge $color={textMuted}>
                      {item.points_required} pts · Eligible to claim
                    </EligibleBadge>
                    <ClaimButton
                      $borderColor={claimButtonColor}
                      $bg={surfaceElevated}
                    >
                      <QrCode size={18} color={claimButtonColor} />
                      <ClaimButtonText $color={claimButtonColor}>
                        Show QR
                      </ClaimButtonText>
                    </ClaimButton>
                  </TxMiddle>
                </RedeemCardTopRow>
              </RedeemCard>
            ))}

          <ViewOlderRow
            onPress={() => router.push("/(demo)/customer/rewards-history")}
            rightIcon={
              <MaterialCommunityIcons
                name="chevron-right"
                size={18}
                color={textMuted}
              />
            }
          >
            <ViewOlderText $color={textMuted}>
              View rewards history
            </ViewOlderText>
          </ViewOlderRow>
        </ScrollContent>
      </Scroll>
    </Container>
  );
}
