import { getCustomerRewards } from "@/features/rewards";
import { useRefetchOnAppFocus } from "@/shared/hooks/use-refetch-on-app-focus";
import { useRefreshOnTabPress } from "@/shared/hooks/use-refresh-on-tab-press";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { getFormattedDate } from "@/shared/lib/utils";
import { BorderRadius, Shadows, Spacing } from "@/shared/theme";
import { LinkButton } from "@/shared/ui/button";
import { NotificationHeaderIcon } from "@/shared/ui/notification-header-icon";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Gift as GiftBold,
  StarsMinimalistic,
} from "@solar-icons/react-native/Bold";
import { Gift, QrCode } from "@solar-icons/react-native/Broken";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { Suspense, useCallback } from "react";
import { Platform, TouchableOpacity } from "react-native";
import { css, styled } from "styled-components/native";
import { RewardsSkeleton } from "./RewardsSkeleton";

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

const DailyLimitNote = styled.View<{ $bg?: string; $borderColor?: string }>`
  flex-direction: row;
  align-items: flex-start;
  gap: ${(p) => p.theme.spacing.sm};
  margin-top: ${(p) => p.theme.spacing.lg};
  padding: ${(p) => p.theme.spacing.md};
  border-radius: ${BorderRadius.md}px;
  background-color: ${(p) => p.$bg ?? p.theme.colors.surfaceElevated};
  border-width: 1px;
  border-color: ${(p) => p.$borderColor ?? p.theme.colors.border};
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

const HeaderRight = styled.View`
  align-items: flex-end;
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

const ActivityStatDivider = styled.View<{ $bg?: string; $opacity?: number }>`
  width: 1px;
  margin-horizontal: ${(p) => p.theme.spacing.lg};
  background-color: ${(p) => p.$bg ?? "transparent"};
  opacity: ${(p) => p.$opacity ?? 1};
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

const PointsIcon = styled.View`
  margin-right: 4px;
`;

const TxCard = styled.View<{ $bg?: string; $opacity?: number }>`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${(p) => p.theme.spacing.md};
  padding-vertical: ${(p) => p.theme.spacing.lg};
  padding-horizontal: ${(p) => p.theme.spacing.xl};
  border-radius: ${BorderRadius.xl}px;
  background-color: ${(p) => p.$bg ?? p.theme.colors.surface};
  opacity: ${(p) => p.$opacity ?? 1};
  ${chunkyShadow}
`;

const RedeemCard = styled(TxCard)`
  flex-direction: column;
  align-items: stretch;
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
  color: ${(p) => p.$color ?? p.theme.colors.text};
`;

const EligibleBadgeWrapper = styled.View<{
  $bg?: string;
  $borderColor?: string;
}>`
  align-self: flex-start;
  margin-top: ${(p) => p.theme.spacing.sm};
  padding-vertical: ${(p) => p.theme.spacing.xs};
  padding-horizontal: ${(p) => p.theme.spacing.sm};
  border-radius: ${BorderRadius.full}px;
  border-width: 1px;
  border-color: ${(p) => p.$borderColor ?? p.theme.colors.border};
  background-color: ${(p) => p.$bg ?? p.theme.colors.surface};
`;

const EligibleBadgeText = styled(ThemedText).attrs({ type: "caption" })<{
  $color?: string;
}>`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.3px;
  color: ${(p) => p.$color ?? p.theme.colors.text};
`;

const ClaimButton = styled(TouchableOpacity)<{
  $borderColor?: string;
  $bg?: string;
}>`
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

const CardTitle = styled(ThemedText).attrs({ type: "subtitle" })`
  margin-bottom: ${(p) => p.theme.spacing.md};
`;

const ViewOlderText = styled(ThemedText).attrs({ type: "caption" })<{
  $color?: string;
}>`
  color: ${(p) => p.$color ?? p.theme.colors.textSecondary};
`;

const CUSTOMER_REWARDS_QUERY_KEY = ["customer-rewards"];

export default function RewardsScreen() {
  return (
    <Suspense fallback={<RewardsSkeleton />}>
      <RewardsContent />
    </Suspense>
  );
}

function RewardsContent() {
  const router = useRouter();

  const { data: rewardsData, refetch } = useSuspenseQuery({
    queryKey: [...CUSTOMER_REWARDS_QUERY_KEY],
    queryFn: getCustomerRewards,
  });

  const refetchRewards = useCallback(() => {
    void refetch();
  }, [refetch]);
  useRefetchOnAppFocus(refetchRewards);
  useRefreshOnTabPress(refetchRewards);

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

  const claimable = rewardsData?.redeemable ?? [];

  const ListHeader = (
    <>
      <Header>
        <HeaderLeft>
          <DateText $color={textMuted}>{getFormattedDate()}</DateText>
          <PageTitle>Rewards</PageTitle>
        </HeaderLeft>
        <HeaderRight>
          <NotificationHeaderIcon inline />
        </HeaderRight>
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
              <PointsIcon>
                <GiftBold size={18} color={accentYellow} />
              </PointsIcon>
              <ActivityStatValue $color={accentYellow}>
                {claimable.reduce(
                  (acc, item) => acc + item.redeemable_count,
                  0,
                )}
              </ActivityStatValue>
            </PointsRow>
          </ActivityStatBlock>
          <ActivityStatDivider $bg={cardOnDarkText} $opacity={0.3} />
          <ActivityStatBlock>
            <ActivityStatLabel $color={cardOnDarkText} $opacity={0.9}>
              Balance
            </ActivityStatLabel>
            <PointsRow>
              <PointsIcon>
                <StarsMinimalistic size={18} color={accentYellow} />
              </PointsIcon>
              <ActivityStatValue $color={accentYellow}>
                {rewardsData?.current_points ?? 0} pts
              </ActivityStatValue>
            </PointsRow>
          </ActivityStatBlock>
        </ActivityStats>
        {claimable.length > 0 && (
          <DailyLimitNote
            $bg="rgba(245, 240, 232, 0.28)"
            $borderColor="rgba(245, 240, 232, 0.45)"
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={accentYellow}
            />
            <DailyLimitNoteText style={{ color: cardOnDarkText }}>
              {rewardsData?.todays_reward_limit_reached
                ? "You have reached the daily reward limit. Come back again tomorrow!"
                : "You can only claim one reward per day."}
            </DailyLimitNoteText>
          </DailyLimitNote>
        )}
      </ActivityCard>
    </>
  );

  return (
    <Container edges={["top", "left", "right"]}>
      <Scroll
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshTintColor={primaryColor}
        onRefresh={async () => {
          await refetch();
        }}
      >
        <ScrollContent>
          {ListHeader}
          {claimable.length > 0 && (
            <>
              <CardTitle>Claimable Rewards</CardTitle>
              {claimable.map((item) => {
                const isDailyLimitReached =
                  rewardsData?.todays_reward_limit_reached ?? false;
                return (
                  <RedeemCard
                    key={item.id}
                    $bg={cardBg}
                    $opacity={isDailyLimitReached ? 0.55 : 1}
                  >
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
                        {item.redeemable_count > 1 && (
                          <EligibleBadgeWrapper>
                            <EligibleBadgeText $color={textMuted}>
                              {item.redeemable_count} available
                            </EligibleBadgeText>
                          </EligibleBadgeWrapper>
                        )}
                        {!isDailyLimitReached && (
                          <ClaimButton
                            activeOpacity={0.7}
                            onPress={() =>
                              router.push("/(customer)/(tabs)/profile")
                            }
                            $borderColor={claimButtonColor}
                            $bg={surfaceElevated}
                          >
                            <QrCode size={18} color={claimButtonColor} />
                            <ClaimButtonText $color={claimButtonColor}>
                              Show QR
                            </ClaimButtonText>
                          </ClaimButton>
                        )}
                      </TxMiddle>
                    </RedeemCardTopRow>
                  </RedeemCard>
                );
              })}
            </>
          )}
          <ViewOlderRow
            onPress={() =>
              router.push(
                "/(customer)/rewards-history" as Parameters<
                  typeof router.push
                >[0],
              )
            }
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
