import { useAuthStore } from "@/features/auth/zustand";
import type { CustomerPoints } from "@/features/history";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { MOCK_POINTS_HISTORY } from "@/shared/lib/demo-data";
import { Shadows, Spacing } from "@/shared/theme";
import { SurfaceCard } from "@/shared/ui/card";
import { ListRow } from "@/shared/ui/list-row";
import { NotificationHeaderIcon } from "@/shared/ui/notification-header-icon";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { getFormattedDate } from "@/shared/lib/utils";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { StarsMinimalistic } from "@solar-icons/react-native/Bold";
import { CourseDown, CourseUp } from "@solar-icons/react-native/Broken";
import { useRouter } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { styled } from "styled-components/native";

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

const ActivityTitle = styled(ThemedText)<{
  $color?: string;
  $opacity?: number;
}>`
  font-size: 22px;
  line-height: 28px;
  font-family: Nunito_800ExtraBold;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
  ${({ $opacity }) => ($opacity != null ? `opacity: ${$opacity};` : "")}
`;

const ActivityStats = styled.View`
  flex-direction: row;
  align-items: stretch;
`;

const ActivityStatBlock = styled.View`
  flex: 1;
`;

const ActivityStatLabel = styled(ThemedText)<{
  $color?: string;
  $opacity?: number;
}>`
  margin-bottom: 4px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
  ${({ $opacity }) => ($opacity != null ? `opacity: ${$opacity};` : "")}
`;

const ActivityStatValue = styled(ThemedText)<{ $color?: string }>`
  font-size: 20px;
  line-height: 26px;
  font-family: Nunito_800ExtraBold;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const ActivityStatDivider = styled.View<{ $bg?: string; $opacity?: number }>`
  width: 1px;
  margin-horizontal: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  opacity: ${({ $opacity }) => $opacity ?? 1};
`;

const PointsRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PointsIcon = styled.View`
  margin-right: 4px;
`;

const SectionTitle = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyText = styled(ThemedText)`
  padding-vertical: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
`;

const PointsScore = styled(ThemedText)<{ $color?: string }>`
  font-size: 20px;
  font-family: Nunito_800ExtraBold;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

function formatTransactionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DemoHistoryScreen() {
  const router = useRouter();
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const accentYellow = useThemeColor({}, "accentYellow");
  const successGreen = useThemeColor({}, "successGreen");
  const iconOnAccent = useThemeColor({}, "brownDark");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const user = useAuthStore((state) => state.user);
  const pointsHistory = MOCK_POINTS_HISTORY;
  const points = pointsHistory[0]?.points ?? 0;

  return (
    <Container edges={["top", "left", "right"]}>
      <Scroll showsVerticalScrollIndicator={false} onRefresh={async () => {}}>
        <ScrollContent>
          <Header>
            <HeaderLeft>
              <DateText type="caption" $color={textMuted}>
                {getFormattedDate()}
              </DateText>
              <PageTitle type="title">Purchase History</PageTitle>
            </HeaderLeft>
            <HeaderRight>
              <NotificationHeaderIcon inline />
            </HeaderRight>
          </Header>

          <ActivityCard $bg={primaryColor}>
            <ActivityCardHeader>
              <ActivityLabel type="caption" $color={accentYellow}>
                OVERVIEW
              </ActivityLabel>
              <CalendarIconBox $bg={accentYellow}>
                <MaterialCommunityIcons
                  name="calendar-month-outline"
                  size={18}
                  color={iconOnAccent}
                />
              </CalendarIconBox>
            </ActivityCardHeader>
            <ActivityTitle $color={cardOnDarkText}>Your Activity</ActivityTitle>
            <ActivityStats>
              <ActivityStatBlock>
                <ActivityStatLabel
                  type="caption"
                  $color={cardOnDarkText}
                  $opacity={0.9}
                >
                  Recent Points Earned
                </ActivityStatLabel>
                <PointsRow>
                  <PointsIcon>
                    {points >= 0 ? (
                      <CourseUp size={18} color={accentYellow} />
                    ) : (
                      <CourseDown size={18} color="#e07c7c" />
                    )}
                  </PointsIcon>
                  <ActivityStatValue
                    $color={points >= 0 ? accentYellow : "#e07c7c"}
                  >
                    {points >= 0 ? `+${points}` : points}
                  </ActivityStatValue>
                </PointsRow>
              </ActivityStatBlock>
              <ActivityStatDivider $bg={cardOnDarkText} $opacity={0.3} />
              <ActivityStatBlock>
                <ActivityStatLabel
                  type="caption"
                  $color={cardOnDarkText}
                  $opacity={0.9}
                >
                  Balance
                </ActivityStatLabel>
                <PointsRow>
                  <PointsIcon>
                    <StarsMinimalistic size={18} color={accentYellow} />
                  </PointsIcon>
                  <ActivityStatValue type="caption" $color={accentYellow}>
                    {user?.loyalty_point?.total_points ?? 0} pts
                  </ActivityStatValue>
                </PointsRow>
              </ActivityStatBlock>
            </ActivityStats>
          </ActivityCard>

          <SectionTitle type="subtitle">Recent Transactions</SectionTitle>

          {pointsHistory.length === 0 ? (
            <EmptyText type="caption">
              No transactions yet. Your points activity will show here!
            </EmptyText>
          ) : (
            <SurfaceCard $padding={Spacing.sm}>
              {pointsHistory.map((item: CustomerPoints, index) => {
                const isEarn = item.type === "earn";
                const pointsLabel = isEarn
                  ? `+${item.points}`
                  : `${item.points}`;
                const pointsColor = item.points < 0 ? "#e07c7c" : successGreen;
                return (
                  <ListRow
                    key={item.id}
                    onPress={() =>
                      router.push({
                        pathname: "/(demo)/customer/history-details",
                        params: {
                          purchaseItems: JSON.stringify(item.purchase_items),
                          transactionDate: item.created_at,
                          description: item.description ?? "",
                        },
                      })
                    }
                    numberOfLines={2}
                    left={
                      <>
                        {isEarn ? (
                          <CourseUp size={22} color={successGreen} />
                        ) : (
                          <CourseDown size={22} color="#e07c7c" />
                        )}
                      </>
                    }
                    title={item.description}
                    subtitle={formatTransactionDate(item.created_at)}
                    right={
                      <ThemedText
                        type="caption"
                        style={{ color: pointsColor, fontWeight: "semibold" }}
                      >
                        {pointsLabel} pts
                      </ThemedText>
                    }
                    showBorder={index < pointsHistory.length - 1}
                  />
                );
              })}
            </SurfaceCard>
          )}
        </ScrollContent>
      </Scroll>
    </Container>
  );
}
