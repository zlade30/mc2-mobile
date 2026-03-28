import React, { Suspense, useCallback } from "react";
import { styled } from "styled-components/native";

import { getCustomerRewards } from "@/features/rewards";
import { useRefetchOnAppFocus } from "@/shared/hooks/use-refetch-on-app-focus";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { Spacing } from "@/shared/theme";
import { SurfaceCard } from "@/shared/ui/card";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { ListRow } from "@/shared/ui/list-row";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { Gift } from "@solar-icons/react-native/Broken";
import { useSuspenseQuery } from "@tanstack/react-query";
import { RewardsHistorySkeleton } from "./RewardsHistorySkeleton";

const CUSTOMER_REWARDS_QUERY_KEY = ["customer-rewards"];

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

const SectionTitle = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EmptyText = styled(ThemedText)`
  padding-vertical: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
`;

const HistoryRowWrapper = styled.View<{ $disabled?: boolean }>`
  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`;

function formatDate(iso: string | Date): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RewardsHistoryContent() {
  const { data: rewards, refetch } = useSuspenseQuery({
    queryKey: [...CUSTOMER_REWARDS_QUERY_KEY],
    queryFn: getCustomerRewards,
  });

  const refetchRewards = useCallback(() => {
    void refetch();
  }, [refetch]);
  useRefetchOnAppFocus(refetchRewards);

  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  function getSubtitle(item: (typeof rewards.history)[0]): string {
    if (item.status === "claimed" && item.claimed_at) {
      return `Claimed on ${formatDate(item.claimed_at)}`;
    } else if (item.status === "expired" && item.expires_at) {
      return `Expired on ${formatDate(item.expires_at)}`;
    }
    return "";
  }

  return (
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Rewards History</PageTitle>
          <HeaderCaption type="caption" $color={textMuted}>
            Expired and claimed rewards will appear here.
          </HeaderCaption>
        </HeaderLeft>
      </HeaderRow>

      <Scroll
        showsVerticalScrollIndicator={false}
        refreshTintColor={primaryColor}
        onRefresh={async () => {
          await refetch();
        }}
      >
        <ScrollContent>
          {rewards.history.length === 0 ? (
            <EmptyText type="caption">
              No rewards yet. Your earned rewards will appear here.
            </EmptyText>
          ) : (
            <SurfaceCard $padding={Spacing.sm}>
              {rewards.history.map(
                (item, index) =>
                  item.reward_details?.length > 0 && (
                    <HistoryRowWrapper
                      key={item.id}
                      $disabled={
                        item.status === "expired" || item.status === "claimed"
                      }
                    >
                      <ListRow
                        numberOfLines={2}
                        left={<Gift size={22} color={screenIconColor} />}
                        title={`${item?.reward_details?.[0]?.item_name} · ${item?.reward_details?.[0]?.variant_name}`}
                        subtitle={getSubtitle(item)}
                        showBorder={
                          index < rewards.history.length - 1 &&
                          item.reward_details?.length <= 0
                        }
                        activeOpacity={1}
                      />
                    </HistoryRowWrapper>
                  ),
              )}
            </SurfaceCard>
          )}
        </ScrollContent>
      </Scroll>
    </Container>
  );
}

export default function RewardsHistoryScreen() {
  return (
    <Suspense fallback={<RewardsHistorySkeleton />}>
      <RewardsHistoryContent />
    </Suspense>
  );
}
