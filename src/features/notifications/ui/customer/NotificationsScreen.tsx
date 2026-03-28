import { getNotificationRoute } from "@/features/notifications";
import { useNotificationsStore } from "@/features/notifications/store";
import type { NotificationItem } from "@/features/notifications/types";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { useNotificationBadgeStore } from "@/shared/store";
import { Spacing } from "@/shared/theme";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { SurfaceCard } from "@/shared/ui/card";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { ListRow } from "@/shared/ui/list-row";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import {
  Gift,
  HandShake,
  Letter,
  TrashBin2,
} from "@solar-icons/react-native/Broken";
import dayjs from "dayjs";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { Platform, Pressable } from "react-native";
import { styled, useTheme } from "styled-components/native";

const ICON_SIZE = 22;

function NotificationIcon({
  item,
  color,
}: {
  item: NotificationItem;
  color: string;
}) {
  const type = typeof item.data?.type === "string" ? item.data.type : undefined;
  if (type === "reward" || type === "rewards") {
    return <Gift size={ICON_SIZE} color={color} />;
  }
  if (type === "promotion") {
    return <HandShake size={ICON_SIZE} color={color} />;
  }
  return <Letter size={ICON_SIZE} color={color} />;
}

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-vertical: ${({ theme }) => theme.spacing.lg};
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const HeaderRight = styled.View`
  align-items: center;
  justify-content: center;
`;

const TrashButton = styled(Pressable)`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
`;

const PageTitle = styled(ThemedText)`
  margin-top: 0;
  margin-bottom: 2px;
`;

const HeaderCaption = styled(ThemedText)<{ $color?: string }>`
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const Scroll = styled(ScrollViewWithRefresh)`
  flex: 1;
`;

const ScrollContent = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const EmptyText = styled(ThemedText)`
  padding-vertical: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
`;

function formatNotificationDate(iso: string): string {
  return dayjs(iso).format("MMM D, h:mm A");
}

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const notifications = useNotificationsStore((s) => s.notifications);
  const clearAllNotifications = useNotificationsStore(
    (s) => s.clearAllNotifications,
  );
  const clearNotificationsBadge = useNotificationBadgeStore(
    (s) => s.clearNotifications,
  );
  const { showConfirm, modalState, hide, getState } = useLocalBottomModal();

  const handleNotificationPress = useCallback(
    (item: NotificationItem) => {
      const route = getNotificationRoute(item.data);
      router.push(route as Parameters<typeof router.push>[0]);
    },
    [router],
  );

  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  const handleClearAll = useCallback(() => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    showConfirm({
      title: "Clear all notifications",
      message:
        "Are you sure you want to remove all notifications? This cannot be undone.",
      cancelText: "Cancel",
      confirmText: "Clear all",
      destructive: true,
      onConfirm: () => {
        clearAllNotifications();
        clearNotificationsBadge();
      },
    });
  }, [clearAllNotifications, clearNotificationsBadge]);

  useEffect(() => {
    clearNotificationsBadge();
  }, [clearNotificationsBadge]);

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Notifications</PageTitle>
          <HeaderCaption type="caption" $color={textMuted}>
            Push notifications will appear here.
          </HeaderCaption>
        </HeaderLeft>
        <HeaderRight>
          <TrashButton onPress={handleClearAll}>
            <TrashBin2 size={22} color={theme.colors.screenIcon} />
          </TrashButton>
        </HeaderRight>
      </HeaderRow>
      <Scroll skipDefaultRefresh onRefresh={async () => {}}>
        <ScrollContent>
          {sortedNotifications.length === 0 ? (
            <EmptyText type="caption">
              No notifications yet. Push notifications will appear here.
            </EmptyText>
          ) : (
            <SurfaceCard $padding={Spacing.sm}>
              {sortedNotifications.map((item, index) => (
                <ListRow
                  key={item.id}
                  numberOfLines={2}
                  left={
                    <NotificationIcon
                      item={item}
                      color={theme.colors.screenIcon}
                    />
                  }
                  title={item.title}
                  subtitle={
                    item.body
                      ? `${item.body} · ${formatNotificationDate(item.createdAt)}`
                      : formatNotificationDate(item.createdAt)
                  }
                  showBorder={index < sortedNotifications.length - 1}
                  onPress={() => handleNotificationPress(item)}
                />
              ))}
            </SurfaceCard>
          )}
        </ScrollContent>
      </Scroll>
      <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </Container>
  );
}
