import type { Promo } from "@/features/promos/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { Suspense, useCallback, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { styled } from "styled-components/native";

import { getPromos } from "@/features/promos";
import { useRefetchOnAppFocus } from "@/shared/hooks/use-refetch-on-app-focus";
import { useRefreshOnTabPress } from "@/shared/hooks/use-refresh-on-tab-press";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { getFormattedDate } from "@/shared/lib/utils";
import { Shadows, Spacing } from "@/shared/theme";
import { SurfaceCard } from "@/shared/ui/card";
import { NotificationHeaderIcon } from "@/shared/ui/notification-header-icon";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import {
  Tag as TagBold,
  UserSpeak as UserSpeakBold,
} from "@solar-icons/react-native/Bold";
import { Eye, Tag, UserSpeak } from "@solar-icons/react-native/Broken";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PromosSkeleton } from "./PromosSkeleton";

dayjs.extend(relativeTime);

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const Scroll = styled(ScrollViewWithRefresh)`
  flex: 1;
`;

const ScrollContent = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
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

const HeaderRight = styled.View`
  align-items: flex-end;
`;

const DateText = styled(ThemedText)<{ $color?: string }>`
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const PageTitle = styled(ThemedText)`
  margin-top: 0;
`;

const ActivityCard = styled.View<{ $bg?: string; $opacity?: number }>`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.xxl};
  padding-vertical: ${({ theme }) => theme.spacing.xxl};
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
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ActivityLabel = styled(ThemedText)<{ $color?: string }>`
  font-size: 11px;
  letter-spacing: 0.5px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const CalendarIconBox = styled.View<{ $bg?: string }>`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radii.sm};
  align-items: center;
  justify-content: center;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const ActivityTitle = styled(ThemedText)<{ $color?: string }>`
  font-size: 22px;
  line-height: 28px;
  font-family: Nunito_800ExtraBold;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const ActivityStats = styled.View`
  flex-direction: row;
  align-items: stretch;
`;

const ActivityStatBlock = styled.View`
  flex: 1;
`;

const ActivityStatValue = styled(ThemedText)<{ $color?: string }>`
  font-size: 20px;
  line-height: 26px;
  font-family: Nunito_800ExtraBold;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const PointsRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const PointsIcon = styled.View`
  margin-right: 4px;
`;

const SectionTitle = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

type TabId = "promos" | "announcement";

const TabBar = styled.View`
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.radii.lg};
  background-color: ${({ theme }) => theme.colors.surface};
`;

const TabButton = styled(TouchableOpacity).attrs(() => ({
  activeOpacity: 0.8,
}))<{ $active?: boolean }>`
  flex: 1;
  padding-vertical: ${({ theme }) => theme.spacing.sm};
  padding-horizontal: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center;
  justify-content: center;
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : "transparent"};
  ${({ $active, theme }) =>
    $active && Platform.OS === "ios"
      ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: 0px 1px;
  shadow-opacity: 0.15;
  shadow-radius: 3px;
`
      : ""}
  ${({ $active }) => ($active ? "elevation: 2;" : "")}
`;

const TabButtonText = styled(ThemedText)<{ $active?: boolean }>`
  font-size: 14px;
  font-family: ${({ $active }) =>
    $active ? "Nunito_700Bold" : "Nunito_600SemiBold"};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primaryForeground : theme.colors.textSecondary};
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

const EmptyText = styled(ThemedText)`
  padding-vertical: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
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

const FullImageCloseBtn = styled(Pressable)<{
  $bg?: string;
}>`
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

function PromosContent() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const accentYellow = useThemeColor({}, "accentYellow");
  const iconOnAccent = useThemeColor({}, "brownDark");
  const cardBg = useThemeColor({}, "surface");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const textColor = useThemeColor({}, "text");
  const [fullImageUri, setFullImageUri] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("promos");

  const getPromosQuery = useSuspenseQuery({
    queryKey: ["promos"],
    queryFn: () => getPromos(),
  });

  const refetchPromos = useCallback(() => {
    void getPromosQuery.refetch();
  }, [getPromosQuery]);

  useRefetchOnAppFocus(refetchPromos);
  useRefreshOnTabPress(refetchPromos);

  const filteredPromos = useMemo(() => {
    const list = getPromosQuery.data ?? [];
    if (activeTab === "announcement") {
      return list.filter((p: Promo) => p.type === "announcement");
    }
    return list.filter(
      (p: Promo) => p.type === "promotion" || p.type === "popup-promotion",
    );
  }, [getPromosQuery.data, activeTab]);

  const activeCount = filteredPromos.length;

  const ListHeader = (
    <>
      <Header>
        <HeaderLeft>
          <DateText type="caption" $color={textMuted}>
            {getFormattedDate()}
          </DateText>
          <PageTitle type="title">Offers</PageTitle>
        </HeaderLeft>
        <HeaderRight>
          <NotificationHeaderIcon inline />
        </HeaderRight>
      </Header>

      <ActivityCard $bg={primaryColor}>
        <ActivityCardHeader>
          <ActivityLabel type="caption" $color={accentYellow}>
            DEALS & UPDATES
          </ActivityLabel>
          <CalendarIconBox $bg={accentYellow}>
            {activeTab === "announcement" ? (
              <UserSpeak size={18} color={iconOnAccent} />
            ) : (
              <Tag size={18} color={iconOnAccent} />
            )}
          </CalendarIconBox>
        </ActivityCardHeader>
        <ActivityTitle $color="#F5F0E8">
          {activeTab === "promos" ? "Active promos" : "Announcements"}
        </ActivityTitle>
        <ActivityStats>
          <ActivityStatBlock>
            <PointsRow>
              <PointsIcon>
                {activeTab === "announcement" ? (
                  <UserSpeakBold size={18} color={accentYellow} />
                ) : (
                  <TagBold size={18} color={accentYellow} />
                )}
              </PointsIcon>
              <ActivityStatValue $color={accentYellow}>
                {activeCount}
              </ActivityStatValue>
            </PointsRow>
          </ActivityStatBlock>
        </ActivityStats>
      </ActivityCard>

      <TabBar>
        <TabButton
          $active={activeTab === "promos"}
          onPress={() => setActiveTab("promos")}
        >
          <TabButtonText $active={activeTab === "promos"}>Promos</TabButtonText>
        </TabButton>
        <TabButton
          $active={activeTab === "announcement"}
          onPress={() => setActiveTab("announcement")}
        >
          <TabButtonText $active={activeTab === "announcement"}>
            Announcement
          </TabButtonText>
        </TabButton>
      </TabBar>

      <SectionTitle type="subtitle">
        {activeTab === "promos" ? "Current promos" : "Announcements"}
      </SectionTitle>
    </>
  );

  return (
    <>
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
                  style={{ width, height }}
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
      <Container edges={["top", "left", "right"]}>
        <Scroll
          showsVerticalScrollIndicator={false}
          refreshTintColor={primaryColor}
          onRefresh={async () => {
            await getPromosQuery.refetch();
          }}
        >
          <ScrollContent>
            {ListHeader}
            {!filteredPromos.length ? (
              <EmptyText type="caption">
                {activeTab === "promos"
                  ? "No promos right now. Check back soon!"
                  : "No announcements right now."}
              </EmptyText>
            ) : (
              filteredPromos.slice(0, 10).map((item) => {
                const goToDetail = () =>
                  router.push(`/(customer)/promo/${item.id}`);
                const thumb = item.thumbnail_url?.trim() ?? "";
                return (
                  <SurfaceCard key={item.id} $padding={Spacing.xs}>
                    <CardPressable onPress={goToDetail}>
                      <PostHeader>
                        <PostHeaderText>
                          <PostTitle type="defaultSemiBold">{item.title}</PostTitle>
                          <PostMetaRow>
                            {item.type === "announcement" ? (
                              <UserSpeak size={16} color={textMuted} />
                            ) : (
                              <Tag size={16} color={textMuted} />
                            )}
                            <PostTime type="caption" $color={textMuted}>
                              {dayjs(item.created_at).fromNow()}
                            </PostTime>
                          </PostMetaRow>
                        </PostHeaderText>
                        <ViewDetailButton
                          onPress={goToDetail}
                        >
                          <Eye size={18} color={textMuted} />
                        </ViewDetailButton>
                      </PostHeader>
                    </CardPressable>

                    {thumb ? (
                      <PostImageWrap
                        $bg={surfaceElevated}
                        onPress={() => setFullImageUri(thumb)}
                      >
                        <Image
                          source={{ uri: thumb }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="contain"
                        />
                      </PostImageWrap>
                    ) : null}

                    <CardPressable onPress={goToDetail}>
                      <PostBody>
                        <ThemedText type="default" style={{ color: textColor }}>
                          {item.excerpt || ""}
                        </ThemedText>
                      </PostBody>
                    </CardPressable>
                  </SurfaceCard>
                );
              })
            )}
            {/* {!!filteredPromos.length && ListFooter} */}
          </ScrollContent>
        </Scroll>
      </Container>
    </>
  );
}

export default function PromosScreen() {
  return (
    <Suspense fallback={<PromosSkeleton />}>
      <PromosContent />
    </Suspense>
  );
}
