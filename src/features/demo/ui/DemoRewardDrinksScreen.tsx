import {
  type StaffItem,
  type StaffItemVariant,
} from "@/features/rewards";
import { useRewardsStore } from "@/features/rewards/zustand";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { MOCK_STAFF_ITEMS } from "@/shared/lib/demo-data";
import { getErrorMessage } from "@/shared/lib/utils";
import { Shadows, Spacing } from "@/shared/theme";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { Input } from "@/shared/ui/input";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { AltArrowRight, CupHot, Gift } from "@solar-icons/react-native/Broken";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  useWindowDimensions,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styled } from "styled-components/native";

/** Same timing as `BottomModalView` / `BottomModalRoot`. */
const VARIANT_MODAL_ANIMATION_MS = 300;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  padding-horizontal: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
`;

const HeaderTitleWrap = styled.View`
  flex: 1;
`;

const HeaderEyebrow = styled(ThemedText)<{ $color: string }>`
  font-size: 11px;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  margin-bottom: 4px;
  color: ${({ $color }) => $color};
`;

const Content = styled.ScrollView`
  flex: 1;
`;

const ContentInner = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.xxxl};
`;

const HeroCard = styled.View<{ $surface: string }>`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.xl};
  background-color: ${({ $surface }) => $surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  overflow: hidden;
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : `elevation: ${Shadows.chunky.elevation};`}
`;

const HeroAccent = styled.View<{ $accent: string }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-top-left-radius: ${({ theme }) => theme.radii.xl};
  border-bottom-left-radius: ${({ theme }) => theme.radii.xl};
  background-color: ${({ $accent }) => $accent};
`;

const HeroIconWrap = styled.View<{ $bg: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radii.lg};
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.md};
  background-color: ${({ $bg }) => $bg};
`;

const HeroTextBlock = styled.View`
  flex: 1;
  min-width: 0;
`;

const HeroLabel = styled(ThemedText)<{ $color: string }>`
  font-size: 12px;
  margin-bottom: 2px;
  color: ${({ $color }) => $color};
`;

const FilterSection = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const GridRow = styled.View`
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  gap: ${({ theme }) => theme.spacing.sm};
`;

const GridItemButton = styled.TouchableOpacity.attrs(() => ({
  activeOpacity: 0.88,
}))<{ $surface: string; $border: string }>`
  flex: 1;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.md};
  min-height: 108px;
  justify-content: space-between;
  background-color: ${({ $surface }) => $surface};
  border-width: 1px;
  border-color: ${({ $border }) => $border};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : `elevation: ${Shadows.chunky.elevation};`}
`;

const GridItemFiller = styled.View`
  flex: 1;
`;

const GridItemIconRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const GridItemIconCircle = styled.View<{ $bg: string }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center;
  justify-content: center;
  background-color: ${({ $bg }) => $bg};
`;

const GridItemName = styled(ThemedText)`
  font-size: 13px;
  line-height: 18px;
`;

const GridItemMeta = styled(ThemedText)<{ $color: string }>`
  font-size: 11px;
  margin-top: ${({ theme }) => theme.spacing.xs};
  color: ${({ $color }) => $color};
`;

const LoadingWrap = styled.View`
  min-height: 200px;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const EmptyText = styled(ThemedText)<{ $color: string }>`
  color: ${({ $color }) => $color};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  line-height: 22px;
`;

/** Matches `BottomModalRoot` / `BottomModalView` overlay layout and backdrop. */
const ModalOverlay = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

const ModalBackdrop = styled(AnimatedPressable)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

const VariantSheet = styled(Animated.View)<{
  $padBottom: number;
  $maxHeight: number;
}>`
  width: 100%;
  border-top-left-radius: ${({ theme }) => theme.radii.xxl};
  border-top-right-radius: ${({ theme }) => theme.radii.xxl};
  padding-top: ${({ theme }) => theme.spacing.md};
  padding-horizontal: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ $padBottom }) => $padBottom}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-bottom-width: 0;
  border-color: ${({ theme }) => theme.colors.border};
  max-height: ${({ $maxHeight }) => $maxHeight}px;
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: 0px -4px;
  shadow-opacity: 0.12;
  shadow-radius: 16px;
`
    : "elevation: 12;"}
`;

const SheetHandle = styled.View<{ $muted: string }>`
  align-self: center;
  width: 40px;
  height: 4px;
  border-radius: ${({ theme }) => theme.radii.full};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ $muted }) => $muted};
`;

const SheetHeaderRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SheetTitleBlock = styled.View`
  flex: 1;
  min-width: 0;
  margin-right: ${({ theme }) => theme.spacing.md};
`;

const SheetSubtitle = styled(ThemedText)<{ $color: string }>`
  margin-top: 4px;
  color: ${({ $color }) => $color};
`;

const SheetBadge = styled.View<{ $bg: string; $fg: string }>`
  padding-vertical: 6px;
  padding-horizontal: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ $bg }) => $bg};
`;

const SheetBadgeText = styled(ThemedText)<{ $color: string }>`
  font-size: 11px;
  letter-spacing: 0.4px;
  color: ${({ $color }) => $color};
`;

const VariantScroll = styled.ScrollView`
  margin-horizontal: -${({ theme }) => theme.spacing.xs};
`;

const VariantScrollInner = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xs};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const VariantRow = styled.TouchableOpacity.attrs(() => ({
  activeOpacity: 0.85,
}))<{ $border: string; $surface: string }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-vertical: ${({ theme }) => theme.spacing.md};
  padding-horizontal: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radii.lg};
  border-width: 1px;
  border-color: ${({ $border }) => $border};
  background-color: ${({ $surface }) => $surface};
`;

const VariantRowLeft = styled.View`
  flex: 1;
  min-width: 0;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const VariantDot = styled.View<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radii.full};
  background-color: ${({ $color }) => $color};
`;

const VariantRowText = styled(ThemedText)`
  font-size: 15px;
  flex: 1;
`;

const CloseButton = styled.TouchableOpacity.attrs(() => ({
  activeOpacity: 0.85,
}))<{ $border: string }>`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-vertical: ${({ theme }) => theme.spacing.md};
  align-items: center;
  border-radius: ${({ theme }) => theme.radii.lg};
  border-width: 1px;
  border-color: ${({ $border }) => $border};
`;

const CloseButtonText = styled(ThemedText)<{ $color: string }>`
  color: ${({ $color }) => $color};
  font-size: 15px;
`;

const chunkItems = (items: StaffItem[], size: number): StaffItem[][] => {
  const rows: StaffItem[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
};

const getVariantLabel = (variant: StaffItemVariant): string => {
  const values = [
    variant.option1_value,
    variant.option2_value,
    variant.option3_value,
  ].filter((value): value is string => Boolean(value));
  return values.join(" · ");
};

export function DemoRewardDrinksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const {
    showConfirm,
    showMessage,
    modalState,
    hide,
    getState,
  } = useLocalBottomModal();
  const params = useLocalSearchParams<{
    rewardRuleId?: string;
    rewardTitle?: string;
  }>();
  const textMuted = useThemeColor({}, "textSecondary");
  const surface = useThemeColor({}, "surface");
  const surfaceSubtle = useThemeColor({}, "surfaceSubtle");
  const accentYellow = useThemeColor({}, "accentYellow");
  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const borderColor = useThemeColor({}, "border");
  const selectedCardBrown = useThemeColor({}, "primary");
  const selectedCardFg = useThemeColor({}, "primaryForeground");
  const choicesBadgeText = useThemeColor({}, "brownDark");
  const iconOnAccentYellow = useThemeColor({}, "brownDark");
  const { customerHashId, setReedemableRewards } = useRewardsStore();
  const [selectedItem, setSelectedItem] = useState<StaffItem | null>(null);
  /** Grid highlight; kept after closing the variant sheet to show confirm so the drink stays visibly selected. */
  const [highlightedItem, setHighlightedItem] = useState<StaffItem | null>(
    null,
  );
  const [drinkFilter, setDrinkFilter] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const closeAnimationLockRef = useRef(false);
  const afterCloseCallbackRef = useRef<(() => void) | undefined>(undefined);
  const keepHighlightAfterCloseRef = useRef(false);

  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(windowHeight);

  const finalizeVariantModalClose = useCallback(() => {
    closeAnimationLockRef.current = false;
    setSelectedItem(null);
    if (!keepHighlightAfterCloseRef.current) {
      setHighlightedItem(null);
    }
    keepHighlightAfterCloseRef.current = false;
    setIsClosing(false);
    const next = afterCloseCallbackRef.current;
    afterCloseCallbackRef.current = undefined;
    next?.();
  }, []);

  const rewardRuleId = Number(params.rewardRuleId);
  const rewardTitle = params.rewardTitle ?? "Reward";

  const itemsQuery = useQuery({
    queryKey: ["demo-staff-items"],
    queryFn: () => Promise.resolve(MOCK_STAFF_ITEMS),
  });

  const filteredItems = useMemo(() => {
    const items = itemsQuery.data ?? [];
    const q = drinkFilter.trim().toLowerCase();
    if (q.length === 0) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [itemsQuery.data, drinkFilter]);

  const claimMutation = useMutation({
    mutationFn: async (_payload: {
      reward_rule_id: number;
      claim_amount: number;
      variant_id: string;
    }) => {},
  });

  const rows = useMemo(() => chunkItems(filteredItems, 3), [filteredItems]);

  const sheetMaxHeight = Math.min(windowHeight * 0.78, 560);

  const showVariantModal = selectedItem != null || isClosing;

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const closeVariantModal = useCallback(
    (afterClose?: () => void, options?: { keepHighlight?: boolean }) => {
      if (closeAnimationLockRef.current) return;
      if (selectedItem == null && !isClosing) {
        afterClose?.();
        return;
      }
      closeAnimationLockRef.current = true;
      keepHighlightAfterCloseRef.current = options?.keepHighlight ?? false;
      afterCloseCallbackRef.current = afterClose;
      setIsClosing(true);
      backdropOpacity.value = withTiming(0, {
        duration: VARIANT_MODAL_ANIMATION_MS,
      });
      translateY.value = withTiming(
        windowHeight,
        { duration: VARIANT_MODAL_ANIMATION_MS },
        (finished) => {
          if (finished) {
            runOnJS(finalizeVariantModalClose)();
          }
        },
      );
    },
    [
      backdropOpacity,
      finalizeVariantModalClose,
      isClosing,
      selectedItem,
      translateY,
      windowHeight,
    ],
  );

  useEffect(() => {
    if (selectedItem != null && !isClosing) {
      backdropOpacity.value = withTiming(1, {
        duration: VARIANT_MODAL_ANIMATION_MS,
      });
      translateY.value = withTiming(0, {
        duration: VARIANT_MODAL_ANIMATION_MS,
      });
    }
  }, [selectedItem, isClosing, backdropOpacity, translateY]);

  const handleVariantSelect = (variant: StaffItemVariant) => {
    if (!Number.isFinite(rewardRuleId)) {
      showMessage({
        title: "Error",
        message: "Invalid reward selected. Please go back and try again.",
      });
      return;
    }

    if (!customerHashId) {
      showMessage({
        title: "Error",
        message: "Customer is not verified yet. Please scan customer QR again.",
      });
      return;
    }

    const item = selectedItem;
    if (item == null) {
      showMessage({
        title: "Error",
        message: "No drink selected. Please choose a drink and try again.",
      });
      return;
    }

    const variantLabel = getVariantLabel(variant);
    const categoryDisplay =
      item.category_name?.trim() || item.name.trim() || "—";

    /** Close the native Modal first, then show confirm — avoids stacking two Modals (Android crash). */
    closeVariantModal(
      () => {
        showConfirm({
          title: "Confirmation",
          message: (
            <>
              Claim{" "}
              <ThemedText type="defaultSemiBold">{rewardTitle}</ThemedText>
              {" with "}
              <ThemedText type="defaultSemiBold">{categoryDisplay}</ThemedText>
              {" · "}
              <ThemedText type="defaultSemiBold">{variantLabel}</ThemedText>?
            </>
          ),
          cancelText: "Cancel",
          confirmText: "Claim",
          keepOpenOnConfirm: true,
          onConfirm: () => {
            return (async () => {
              try {
                await claimMutation.mutateAsync({
                  reward_rule_id: rewardRuleId,
                  claim_amount: 1,
                  variant_id: variant.variant_id,
                });
                setReedemableRewards([]);
                showMessage({
                  title: "Success",
                  message: "The reward has been claimed successfully.",
                  onClose: () => router.replace("/(demo)/staff/(tabs)"),
                });
              } catch (error) {
                showMessage({
                  title: "Error",
                  message: getErrorMessage(
                    error,
                    "Failed to claim reward. Please try again.",
                  ),
                });
                // Keep the confirmation modal open so staff can retry.
                throw error;
              }
            })();
          },
        });
      },
      { keepHighlight: true },
    );
  };

  return (
    <Container>
      <Header>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderTitleWrap>
          <ThemedText type="title">Reward drinks</ThemedText>
          <ThemedText
            type="caption"
            lightColor={textMuted}
            darkColor={textMuted}
          >
            Select a drink to claim.
          </ThemedText>
        </HeaderTitleWrap>
      </Header>

      <Content
        showsVerticalScrollIndicator={false}
        pointerEvents={isClosing ? "none" : "auto"}
      >
        <ContentInner>
          <HeroCard $surface={surface}>
            <HeroAccent $accent={accentYellow} />
            <HeroIconWrap $bg={surfaceSubtle}>
              <Gift size={26} color={screenIconColor} />
            </HeroIconWrap>
            <HeroTextBlock>
              <HeroLabel type="caption" $color={textMuted}>
                Claiming for
              </HeroLabel>
              <ThemedText type="subtitle" numberOfLines={2}>
                {rewardTitle}
              </ThemedText>
            </HeroTextBlock>
          </HeroCard>

          {!itemsQuery.isLoading && (itemsQuery.data?.length ?? 0) > 0 ? (
            <FilterSection>
              <Input
                value={drinkFilter}
                onChangeText={setDrinkFilter}
                placeholder="Search drinks…"
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                accessibilityLabel="Filter drinks by name"
                style={{ marginBottom: 0 }}
              />
            </FilterSection>
          ) : null}

          {itemsQuery.isLoading ? (
            <LoadingWrap>
              <ActivityIndicator size="large" color={primaryColor} />
            </LoadingWrap>
          ) : null}

          {!itemsQuery.isLoading && (itemsQuery.data?.length ?? 0) === 0 ? (
            <EmptyText type="default" $color={textMuted}>
              No drinks available at the moment. Try again in a moment or
              contact support if this continues.
            </EmptyText>
          ) : null}

          {!itemsQuery.isLoading &&
          (itemsQuery.data?.length ?? 0) > 0 &&
          filteredItems.length === 0 ? (
            <EmptyText type="default" $color={textMuted}>
              No drinks match your search. Try a different name or clear the
              filter.
            </EmptyText>
          ) : null}

          {rows.map((row, rowIndex) => (
            <GridRow key={`row-${rowIndex}`}>
              {row.map((item) => {
                const isSelected = highlightedItem?.id === item.id;
                return (
                  <GridItemButton
                    key={item.id}
                    $surface={isSelected ? selectedCardBrown : surface}
                    $border={isSelected ? selectedCardBrown : borderColor}
                    onPress={() => {
                      setSelectedItem(item);
                      setHighlightedItem(item);
                    }}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <GridItemIconRow>
                      <GridItemIconCircle
                        $bg={isSelected ? accentYellow : surfaceSubtle}
                      >
                        <CupHot
                          size={22}
                          color={
                            isSelected ? iconOnAccentYellow : screenIconColor
                          }
                        />
                      </GridItemIconCircle>
                      <AltArrowRight
                        size={20}
                        color={isSelected ? selectedCardFg : textMuted}
                      />
                    </GridItemIconRow>
                    <GridItemName
                      type="defaultSemiBold"
                      numberOfLines={3}
                      lightColor={isSelected ? selectedCardFg : undefined}
                      darkColor={isSelected ? selectedCardFg : undefined}
                    >
                      {item.name}
                    </GridItemName>
                    <GridItemMeta
                      type="caption"
                      $color={isSelected ? selectedCardFg : textMuted}
                    >
                      {item.variants.length}{" "}
                      {item.variants.length === 1 ? "variant" : "variants"}
                    </GridItemMeta>
                  </GridItemButton>
                );
              })}
              {row.length < 3
                ? Array.from({ length: 3 - row.length }).map(
                    (_, fillerIndex) => (
                      <GridItemFiller
                        key={`filler-${rowIndex}-${fillerIndex}`}
                      />
                    ),
                  )
                : null}
            </GridRow>
          ))}
        </ContentInner>
      </Content>

      <Modal
        transparent
        animationType="none"
        statusBarTranslucent
        visible={showVariantModal}
        onRequestClose={() => closeVariantModal()}
      >
        <ModalOverlay>
          <ModalBackdrop
            style={backdropAnimatedStyle}
            onPress={() => closeVariantModal()}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
          />
          <VariantSheet
            style={sheetAnimatedStyle}
            $padBottom={Math.max(insets.bottom, Spacing.lg)}
            $maxHeight={sheetMaxHeight}
          >
            <SheetHandle $muted={borderColor} />
            <SheetHeaderRow>
              <SheetTitleBlock>
                <ThemedText type="subtitle" numberOfLines={2}>
                  {selectedItem?.name ?? "Variants"}
                </ThemedText>
                <SheetSubtitle type="caption" $color={textMuted}>
                  Select a variant to claim.
                </SheetSubtitle>
              </SheetTitleBlock>
              <SheetBadge $bg={accentYellow} $fg={choicesBadgeText}>
                <SheetBadgeText type="caption" $color={choicesBadgeText}>
                  {selectedItem?.variants.length ?? 0} choices
                </SheetBadgeText>
              </SheetBadge>
            </SheetHeaderRow>

            <VariantScroll
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <VariantScrollInner>
                {selectedItem?.variants.map((variant) => (
                  <VariantRow
                    key={variant.variant_id}
                    $border={borderColor}
                    $surface={surfaceSubtle}
                    onPress={() => handleVariantSelect(variant)}
                    disabled={claimMutation.isPending}
                  >
                    <VariantRowLeft>
                      <VariantDot $color={accentYellow} />
                      <VariantRowText type="defaultSemiBold" numberOfLines={2}>
                        {getVariantLabel(variant)}
                      </VariantRowText>
                    </VariantRowLeft>
                    <AltArrowRight size={20} color={screenIconColor} />
                  </VariantRow>
                ))}
              </VariantScrollInner>
            </VariantScroll>

            <CloseButton
              $border={borderColor}
              onPress={() => closeVariantModal()}
            >
              <CloseButtonText type="defaultSemiBold" $color={textMuted}>
                Close
              </CloseButtonText>
            </CloseButton>
          </VariantSheet>
        </ModalOverlay>
      </Modal>
      <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </Container>
  );
}
