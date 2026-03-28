import type { PurchaseItem } from "@/features/history";
import { getCustomerPoints } from "@/features/history";
import { useRefetchOnAppFocus } from "@/shared/hooks/use-refetch-on-app-focus";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { Spacing } from "@/shared/theme";
import { SurfaceCard } from "@/shared/ui/card";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { ListRow } from "@/shared/ui/list-row";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { CartLarge2 } from "@solar-icons/react-native/Broken";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { Suspense, useCallback, useMemo } from "react";
import { styled } from "styled-components/native";
import { HistoryDetailsSkeleton } from "./HistoryDetailsSkeleton";

type HistoryDetailsParams = {
  purchaseItems?: string;
  transactionDate?: string;
  description?: string;
  fromHistoryItem?: string;
};

const CUSTOMER_POINTS_QUERY_KEY = ["customerPointsHistory"];

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

const EmptyText = styled(ThemedText)`
  padding-vertical: ${({ theme }) => theme.spacing.xxl};
  text-align: center;
`;

const AmountText = styled(ThemedText)`
  font-weight: 600;
`;

function formatTransactionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });
}

type FlattenedPurchaseItem = PurchaseItem & {
  transactionDate: string;
  transactionId: number;
};

function flattenPurchaseItems(
  pointsHistory: Awaited<ReturnType<typeof getCustomerPoints>>,
): FlattenedPurchaseItem[] {
  const flattened: FlattenedPurchaseItem[] = [];
  for (const t of pointsHistory) {
    for (const p of t.purchase_items) {
      flattened.push({
        ...p,
        transactionDate: t.created_at,
        transactionId: t.id,
      });
    }
  }
  flattened.sort(
    (a, b) =>
      new Date(b.transactionDate).getTime() -
      new Date(a.transactionDate).getTime(),
  );
  return flattened;
}

function parsePurchaseItemsParam(value: string | undefined): PurchaseItem[] {
  if (value == null || value === "") return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as PurchaseItem[]) : [];
  } catch {
    return [];
  }
}

function DetailsList({
  items,
  transactionDate,
  screenIconColor,
}: {
  items: FlattenedPurchaseItem[];
  transactionDate: string;
  screenIconColor: string;
}) {
  return (
    <SurfaceCard $padding={Spacing.sm}>
      {items.map((item, index) => {
        const title =
          item.variant_name?.trim() !== ""
            ? `${item.item_name} · ${item.variant_name}`
            : item.item_name;
        const subtitle = `Qty ${item.quantity} · ${formatTransactionDate(transactionDate)}`;
        return (
          <ListRow
            key={item.id}
            numberOfLines={2}
            left={<CartLarge2 size={22} color={screenIconColor} />}
            title={title}
            subtitle={subtitle}
            right={
              <AmountText type="caption">
                {formatCurrency(item.total_money)}
              </AmountText>
            }
            showBorder={index < items.length - 1}
          />
        );
      })}
    </SurfaceCard>
  );
}

function RewardHistoryDetailsFromParams({
  purchaseItems,
  transactionDate,
  description,
}: {
  purchaseItems: PurchaseItem[];
  transactionDate: string;
  description: string;
}) {
  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const textMuted = useThemeColor({}, "textSecondary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  const itemsWithDate: FlattenedPurchaseItem[] = useMemo(
    () =>
      purchaseItems.map((p) => ({
        ...p,
        transactionDate,
        transactionId: 0,
      })),
    [purchaseItems, transactionDate],
  );

  return (
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Transaction Details</PageTitle>
          <HeaderCaption type="caption" $color={textMuted}>
            {description !== "" ? description : "Items from this transaction."}
          </HeaderCaption>
        </HeaderLeft>
      </HeaderRow>

      <Scroll
        showsVerticalScrollIndicator={false}
        refreshTintColor={primaryColor}
      >
        <ScrollContent>
          {itemsWithDate.length === 0 ? (
            <EmptyText type="caption">No purchase items.</EmptyText>
          ) : (
            <DetailsList
              items={itemsWithDate}
              transactionDate={transactionDate}
              screenIconColor={screenIconColor}
            />
          )}
        </ScrollContent>
      </Scroll>
    </Container>
  );
}

function RewardHistoryDetailsContent() {
  const { data: pointsHistory, refetch } = useSuspenseQuery({
    queryKey: [...CUSTOMER_POINTS_QUERY_KEY],
    queryFn: getCustomerPoints,
  });

  const refetchDetails = useCallback(() => {
    void refetch();
  }, [refetch]);
  useRefetchOnAppFocus(refetchDetails);

  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  const flattenedItems = flattenPurchaseItems(pointsHistory);

  return (
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Reward History Details</PageTitle>
          <HeaderCaption type="caption" $color={textMuted}>
            Items from your purchase history.
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
          {flattenedItems.length === 0 ? (
            <EmptyText type="caption">No purchase items yet.</EmptyText>
          ) : (
            <SurfaceCard $padding={Spacing.sm}>
              {flattenedItems.map((item, index) => {
                const title =
                  item.variant_name?.trim() !== ""
                    ? `${item.item_name} · ${item.variant_name}`
                    : item.item_name;
                const subtitle = `Qty ${item.quantity} · ${formatTransactionDate(item.transactionDate)}`;
                return (
                  <ListRow
                    key={`${item.transactionId}-${item.id}`}
                    numberOfLines={2}
                    left={<CartLarge2 size={22} color={screenIconColor} />}
                    title={title}
                    subtitle={subtitle}
                    right={
                      <AmountText type="caption">
                        {formatCurrency(item.total_money)}
                      </AmountText>
                    }
                    showBorder={index < flattenedItems.length - 1}
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

export default function HistoryDetailsScreen() {
  const params = useLocalSearchParams<HistoryDetailsParams>();
  const purchaseItems = useMemo(
    () => parsePurchaseItemsParam(params.purchaseItems),
    [params.purchaseItems],
  );
  const transactionDate = params.transactionDate ?? "";
  const fromHistoryItem = params.fromHistoryItem === "1";
  const hasHistoryParams = fromHistoryItem && transactionDate !== "";

  if (hasHistoryParams) {
    return (
      <RewardHistoryDetailsFromParams
        purchaseItems={purchaseItems}
        transactionDate={transactionDate}
        description={params.description ?? ""}
      />
    );
  }

  return (
    <Suspense fallback={<HistoryDetailsSkeleton />}>
      <RewardHistoryDetailsContent />
    </Suspense>
  );
}
