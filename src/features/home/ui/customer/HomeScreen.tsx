import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { Suspense, useCallback, useState } from "react";
import { Modal, Platform, Pressable, useWindowDimensions } from "react-native";
import { styled } from "styled-components/native";

import type { RewardProgressItem } from "@/features/auth";
import { useAuthStore } from "@/features/auth/zustand";
import { getPromos } from "@/features/promos";
import { getCustomerRewards } from "@/features/rewards";
import { useRefetchOnAppFocus } from "@/shared/hooks/use-refetch-on-app-focus";
import { useRefreshOnTabPress } from "@/shared/hooks/use-refresh-on-tab-press";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { getFormattedDate } from "@/shared/lib/utils";
import { Shadows, Spacing } from "@/shared/theme";
import { LinkButton } from "@/shared/ui/button";
import { SurfaceCard } from "@/shared/ui/card";
import { NotificationHeaderIcon } from "@/shared/ui/notification-header-icon";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { StarsMinimalistic } from "@solar-icons/react-native/Bold";
import {
  ArrowRight,
  Eye,
  Star,
  Tag,
  UserSpeak,
} from "@solar-icons/react-native/Broken";
import { useSuspenseQueries } from "@tanstack/react-query";

import { HomeSkeleton } from "./HomeSkeleton";

dayjs.extend(relativeTime);

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

const PromoEmpty = styled(ThemedText)<{ $color?: string }>`
  padding-vertical: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const PostHeader = styled.View`
  flex-direction: row;
  align-items: flex-start;
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PostHeaderText = styled.View`
  flex: 1;
  min-width: 0;
`;

const PostTitle = styled(ThemedText)`
  margin-bottom: 2px;
`;

const PostTime = styled(ThemedText)<{ $color?: string }>`
  font-size: 12px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const PostMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ViewDetailButton = styled(Pressable)`
  padding: ${({ theme }) => theme.spacing.xs};
  margin-left: ${({ theme }) => theme.spacing.sm};
`;

const CardPressable = styled(Pressable)`
  width: 100%;
`;

const PostImageWrap = styled(Pressable)<{ $bg?: string }>`
  width: 100%;
  min-height: 120px;
  aspect-ratio: 16/9;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const PostBody = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FullImageBackdrop = styled(Pressable)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.9);
  justify-content: center;
  align-items: center;
`;

const FullImageContent = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const FullImageCloseBtn = styled(Pressable)<{ $bg?: string }>`
  position: absolute;
  top: 48px;
  right: ${({ theme }) => theme.spacing.lg};
  width: 44px;
  height: 44px;
  border-radius: 22px;
  justify-content: center;
  align-items: center;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const ViewAllRow = styled(LinkButton)`
  flex-direction: row;
  align-items: flex-start;
`;

const ViewAllLink = styled(ThemedText)<{ $color?: string }>`
  font-weight: 600;
  font-size: 12px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
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
  flex-direction: row;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  padding-vertical: ${({ theme }) => theme.spacing.sm};
  padding-horizontal: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  border-width: 1px;
  border-color: rgba(245, 240, 232, 0.45);
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const CtaText = styled(ThemedText)<{ $color?: string }>`
  flex: 1;
  margin-top: 0;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const user = useAuthStore((state) => state.user);
  const [fullImageUri, setFullImageUri] = useState<string | null>(null);

  const totalPoints = user?.loyalty_point?.total_points ?? 0;
  const rewardProgress: RewardProgressItem[] = user?.reward_progress ?? [];
  const primaryReward = rewardProgress[0];

  const [getPromosQuery, getCustomerRewardsQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["promos"],
        queryFn: getPromos,
      },
      {
        queryKey: ["customer-rewards"],
        queryFn: getCustomerRewards,
      },
    ],
  });

  const refresh = useCallback(async () => {
    await Promise.all([
      getPromosQuery.refetch(),
      getCustomerRewardsQuery.refetch(),
    ]);
  }, [getPromosQuery, getCustomerRewardsQuery]);
  useRefetchOnAppFocus(refresh);
  useRefreshOnTabPress(refresh);

  const promos = getPromosQuery.data;
  const customerRewards = getCustomerRewardsQuery.data;

  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const textMuted = useThemeColor({}, "textSecondary");
  const accentYellow = useThemeColor({}, "accentYellow");
  const iconOnAccent = useThemeColor({}, "brownDark");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const cardBg = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  return (
    <Container edges={["top", "left", "right"]}>
      <Modal
        visible={!!fullImageUri}
        transparent
        animationType="fade"
        onRequestClose={() => setFullImageUri(null)}
      >
        <FullImageBackdrop onPress={() => setFullImageUri(null)}>
          <FullImageContent pointerEvents="box-none">
            {fullImageUri ? (
              <Pressable onPress={() => {}}>
                <Image
                  source={{ uri: fullImageUri }}
                  style={{ width: windowWidth, height: windowHeight }}
                  contentFit="contain"
                />
              </Pressable>
            ) : null}
          </FullImageContent>
          <FullImageCloseBtn onPress={() => setFullImageUri(null)} $bg={cardBg}>
            <MaterialCommunityIcons name="close" size={24} color={textColor} />
          </FullImageCloseBtn>
        </FullImageBackdrop>
      </Modal>
      <Scroll showsVerticalScrollIndicator onRefresh={refresh}>
        <ScrollContent>
          {/* Header: date, greeting */}
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
              <HeaderDateRow>
                <Greeting type="title">{user?.name ?? "Guest"} 👋</Greeting>
                <NotificationHeaderIcon inline />
              </HeaderDateRow>
            </HeaderLeft>
          </Header>

          {/* 1. Points & next reward card (reference-style with milestones) */}
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

            {customerRewards?.redeemable?.length > 0 ? (
              <>
                {customerRewards?.todays_reward_limit_reached ? (
                  <CtaBox $bg="rgba(245, 240, 232, 0.28)">
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={20}
                      color={accentYellow}
                    />
                    <CtaText type="caption" $color={cardOnDarkText}>
                      You have reached the daily reward limit. Come back again
                      tomorrow!
                    </CtaText>
                  </CtaBox>
                ) : (
                  <CtaBox $bg="rgba(245, 240, 232, 0.28)">
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={20}
                      color={accentYellow}
                    />
                    <CtaText type="caption" $color={cardOnDarkText}>
                      You are now eligible to claim a reward! 🎁
                    </CtaText>
                  </CtaBox>
                )}
              </>
            ) : (
              <CtaBox $bg="rgba(245, 240, 232, 0.28)">
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color={accentYellow}
                />
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
              onPress={() => router.push("/(customer)/(tabs)/rewards")}
            >
              <ViewRewardsDetailsText type="caption" $color={cardOnDarkText}>
                View Rewards Details
              </ViewRewardsDetailsText>
              <ViewRewardsDetailsArrow>
                <ArrowRight size={18} color={cardOnDarkText} />
              </ViewRewardsDetailsArrow>
            </ViewRewardsDetailsRow>
          </ActivityCard>

          {/* Promos list */}
          <SectionHeaderRow>
            <CardTitle type="subtitle">Recent Offers</CardTitle>
            <ViewAllRow
              onPress={() => router.push("/(customer)/(tabs)/promos")}
            >
              <ViewAllLink type="caption" $color={screenIconColor}>
                View all
              </ViewAllLink>
              <ViewAllArrow>
                <ArrowRight size={18} color={screenIconColor} />
              </ViewAllArrow>
            </ViewAllRow>
          </SectionHeaderRow>
          {!promos.length ? (
            <SurfaceCard $padding={Spacing.sm}>
              <PromoEmpty type="caption" $color={textMuted}>
                No promos as of this moment. Check back soon!
              </PromoEmpty>
            </SurfaceCard>
          ) : (
            promos.slice(0, 3).map((promo) => {
              const goToDetail = () =>
                router.push(`/(customer)/promo/${promo.id}`);
              return (
                <SurfaceCard key={promo.id} $padding={Spacing.xs}>
                  <CardPressable onPress={goToDetail}>
                    <PostHeader>
                      <PostHeaderText>
                        <PostTitle type="defaultSemiBold">
                          {promo.title}
                        </PostTitle>
                        <PostMetaRow>
                          {promo.type === "announcement" ? (
                            <UserSpeak size={16} color={textMuted} />
                          ) : (
                            <Tag size={16} color={textMuted} />
                          )}
                          <PostTime type="caption" $color={textMuted}>
                            {dayjs(promo.created_at).fromNow()}
                          </PostTime>
                        </PostMetaRow>
                      </PostHeaderText>
                      <ViewDetailButton onPress={goToDetail}>
                        <Eye size={18} color={textMuted} />
                      </ViewDetailButton>
                    </PostHeader>
                  </CardPressable>

                  {promo.thumbnail_url?.trim() ? (
                    <PostImageWrap
                      $bg={surfaceElevated}
                      onPress={() =>
                        setFullImageUri(promo.thumbnail_url ?? null)
                      }
                    >
                      <Image
                        source={{ uri: promo.thumbnail_url }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="contain"
                      />
                    </PostImageWrap>
                  ) : null}

                  <CardPressable onPress={goToDetail}>
                    <PostBody>
                      <ThemedText type="default" style={{ color: textColor }}>
                        {promo.excerpt || ""}
                      </ThemedText>
                    </PostBody>
                  </CardPressable>
                </SurfaceCard>
              );
            })
          )}
        </ScrollContent>
      </Scroll>
    </Container>
  );
}
