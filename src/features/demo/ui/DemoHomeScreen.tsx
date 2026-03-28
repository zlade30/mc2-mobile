import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Platform, View } from "react-native";
import { styled } from "styled-components/native";

import type { RewardProgressItem } from "@/features/auth";
import { useAuthStore } from "@/features/auth/zustand";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { MOCK_CUSTOMER_REWARDS, MOCK_PROMOS } from "@/shared/lib/demo-data";
import { Shadows, Spacing } from "@/shared/theme";
import { LinkButton } from "@/shared/ui/button";
import { SurfaceCard } from "@/shared/ui/card";
import { ListRow } from "@/shared/ui/list-row";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { getFormattedDate } from "@/shared/lib/utils";
import { StarsMinimalistic } from "@solar-icons/react-native/Bold";
import {
  ArrowRight,
  Star,
  Tag,
  UserSpeakRounded,
} from "@solar-icons/react-native/Broken";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const Scroll = styled(ScrollViewWithRefresh)`
  flex: 1;
`;

const ScrollContent = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-top: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const HeaderDateRow = styled.View`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DateText = styled(ThemedText)<{ $color?: string }>`
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const Greeting = styled(ThemedText)`
  margin-top: 0;
`;

const ActivityCard = styled.View<{ $bg?: string; $opacity?: number }>`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.xxl};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  opacity: ${({ $opacity }) => $opacity ?? 1};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : "elevation: 4;"}
`;

const ActivityCardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const ActivityLabel = styled(ThemedText)<{ $color?: string }>`
  font-size: 11px;
  letter-spacing: 0.5px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const LevelIconBox = styled.View<{ $bg?: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  align-items: center;
  justify-content: center;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const PointsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-height: 40px;
`;

const PointsScore = styled(ThemedText)<{ $color?: string }>`
  font-size: 40px;
  line-height: 58px;
  font-family: Nunito_800ExtraBold;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const SectionHeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ViewAllRow = styled(LinkButton)`
  flex-direction: row;
  align-items: flex-start;
`;

const ViewAllLink = styled(ThemedText)<{ $color?: string }>`
  font-weight: 600;
  font-size: 12px;
`;

const ViewAllArrow = styled.View`
  margin-left: 4px;
`;

const ViewRewardsDetailsRow = styled(LinkButton)`
  flex-direction: row;
  align-items: center;
`;

const ViewRewardsDetailsText = styled(ThemedText)<{ $color?: string }>`
  font-size: 12px;
  opacity: 0.95;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const ViewRewardsDetailsArrow = styled.View`
  margin-left: 4px;
`;

const CtaBox = styled.View<{ $bg?: string }>`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-vertical: ${({ theme }) => theme.spacing.sm};
  padding-horizontal: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const CtaText = styled(ThemedText)<{ $color?: string }>`
  margin-top: 0;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DemoHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const totalPoints = MOCK_CUSTOMER_REWARDS.current_points;
  const rewardProgress: RewardProgressItem[] = user?.reward_progress ?? [];
  const primaryReward = rewardProgress[0];
  const promos = MOCK_PROMOS;
  const customerRewards = MOCK_CUSTOMER_REWARDS;

  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const textMuted = useThemeColor({}, "textSecondary");
  const accentYellow = useThemeColor({}, "accentYellow");
  const iconOnAccent = useThemeColor({}, "brownDark");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  const refresh = useCallback(() => {}, []);

  return (
    <Container edges={["top", "left", "right"]}>
      <Scroll showsVerticalScrollIndicator>
        <ScrollContent>
          <Header>
            <HeaderLeft>
              <HeaderDateRow>
                <DateText type="caption" $color={textMuted}>
                  {getGreeting().toUpperCase()}
                </DateText>
                <DateText type="caption" $color={textMuted}>
                  {getFormattedDate()}
                </DateText>
              </HeaderDateRow>
              <Greeting type="title">{user?.name ?? "Guest"} 👋</Greeting>
            </HeaderLeft>
          </Header>

          <ActivityCard $bg={primaryColor}>
            <ActivityCardHeader>
              <ActivityLabel type="caption" $color={accentYellow}>
                POINTS BALANCE
              </ActivityLabel>
              <LevelIconBox $bg={accentYellow}>
                <Star size={18} color={iconOnAccent} />
              </LevelIconBox>
            </ActivityCardHeader>
            <PointsContainer>
              <StarsMinimalistic size={40} color={accentYellow} />
              <PointsScore type="caption" $color={accentYellow}>
                {totalPoints}
              </PointsScore>
            </PointsContainer>

            {customerRewards.redeemable?.length > 0 ? (
              <CtaBox $bg="rgba(245, 240, 232, 0.28)">
                <CtaText type="caption" $color={cardOnDarkText}>
                  You are now eligible to claim a reward! 🎁
                </CtaText>
              </CtaBox>
            ) : (
              <CtaBox $bg="rgba(245, 240, 232, 0.28)">
                <CtaText type="caption" $color={cardOnDarkText}>
                  Enjoy{" "}
                  <ThemedText
                    style={{
                      fontFamily: "Nunito_600Bold",
                      fontSize: 12,
                      fontWeight: "bold",
                      color: accentYellow,
                    }}
                  >
                    {primaryReward?.reward_title}
                  </ThemedText>{" "}
                  when you earn{" "}
                  <ThemedText
                    style={{
                      fontFamily: "Nunito_600Bold",
                      fontSize: 12,
                      fontWeight: "bold",
                      color: accentYellow,
                    }}
                  >
                    {primaryReward?.points_required} points!
                  </ThemedText>
                </CtaText>
              </CtaBox>
            )}

            <ViewRewardsDetailsRow
              onPress={() => router.push("/(demo)/customer/(tabs)/rewards")}
            >
              <ViewRewardsDetailsText type="caption" $color={cardOnDarkText}>
                View Rewards Details
              </ViewRewardsDetailsText>
              <ViewRewardsDetailsArrow>
                <ArrowRight size={18} color={cardOnDarkText} />
              </ViewRewardsDetailsArrow>
            </ViewRewardsDetailsRow>
          </ActivityCard>

          <SectionHeaderRow>
            <CardTitle type="subtitle">Recent Offers</CardTitle>
            <ViewAllRow
              onPress={() => router.push("/(demo)/customer/(tabs)/promos")}
            >
              <ViewAllLink type="caption" $color={screenIconColor}>
                View all
              </ViewAllLink>
              <ViewAllArrow>
                <ArrowRight size={18} color={screenIconColor} />
              </ViewAllArrow>
            </ViewAllRow>
          </SectionHeaderRow>
          <SurfaceCard $padding={Spacing.sm}>
            {promos.length === 0 ? (
              <ThemedText type="caption" style={{ color: textMuted }}>
                No promos as of this moment. Check back soon!
              </ThemedText>
            ) : (
              promos
                .slice(0, 5)
                .map((promo, index) => (
                  <ListRow
                    key={promo.id}
                    onPress={() =>
                      router.push("/(demo)/customer/(tabs)/promos")
                    }
                    left={
                      <View>
                        {promo.type === "announcement" ? (
                          <UserSpeakRounded
                            size={20}
                            color={screenIconColor}
                            style={{ marginTop: 2 }}
                          />
                        ) : (
                          <Tag
                            size={20}
                            color={screenIconColor}
                            style={{ marginTop: 4 }}
                          />
                        )}
                      </View>
                    }
                    title={promo.title}
                    subtitle={promo.excerpt || ""}
                    right={<ArrowRight size={18} color={screenIconColor} />}
                    showBorder={index < Math.min(promos.length, 5) - 1}
                  />
                ))
            )}
          </SurfaceCard>
        </ScrollContent>
      </Scroll>
    </Container>
  );
}
