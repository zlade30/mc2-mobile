import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "expo-router";
import {
  AppState,
  type AppStateStatus,
  Modal,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { ThemeProvider, styled } from "styled-components/native";

import { useAuthStore } from "@/features/auth/zustand";
import { getPromos } from "@/features/promos";
import type { Promo } from "@/features/promos/types";
import { usePopupPromoStore, useThemeForStyled } from "@/shared/store";
import { ThemedText } from "@/shared/ui/themed-text";

function getLatestPromo(promos: Promo[]): Promo | null {
  if (promos.length === 0) return null;

  const toMs = (p: Promo) => {
    const ms = new Date(p.created_at).getTime();
    return Number.isFinite(ms) ? ms : 0;
  };

  return promos.reduce((best, current) => {
    const bestMs = toMs(best);
    const currentMs = toMs(current);
    if (currentMs > bestMs) return current;
    if (currentMs < bestMs) return best;

    // Stable tie-breaker for identical timestamps.
    return current.id > best.id ? current : best;
  }, promos[0]);
}

const Backdrop = styled(Pressable)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
  justify-content: center;
  align-items: center;
  padding: ${(p) => p.theme.spacing.sm};
`;

const ImageWrap = styled.View<{
  $aspectRatio: number | null;
  $width: number;
  $height: number;
}>`
  width: ${(p) => p.$width}px;
  height: ${(p) => p.$height}px;
  overflow: hidden;
  margin-bottom: ${(p) => p.theme.spacing.md};
  background-color: ${(p) => p.theme.colors.surface};
  border-radius: ${(p) => p.theme.radii.lg};
`;

const RoundedImageClip = styled.View`
  flex: 1;
  border-radius: ${(p) => p.theme.radii.lg};
  overflow: hidden;
`;

const ImagePlaceholder = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: ${(p) => p.theme.spacing.sm};
`;

const PlaceholderText = styled(ThemedText)`
  font-size: 13px;
  color: ${(p) => p.theme.colors.textSecondary};
`;

const RemindLaterBtn = styled(Pressable)`
  padding-vertical: ${(p) => p.theme.spacing.md};
  padding-horizontal: ${(p) => p.theme.spacing.xl};
  align-self: center;
`;

const RemindLaterText = styled(ThemedText)`
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

const MAX_POPUP_WIDTH_PX = 400;
const MAX_WIDTH_FRACTION = 0.9;
const MAX_HEIGHT_FRACTION = 0.85;
const DEFAULT_ASPECT_RATIO = 3 / 4;

function getPopupDimensions(
  windowWidth: number,
  windowHeight: number,
  aspectRatio: number | null
): { width: number; height: number } {
  const maxW = Math.min(windowWidth * MAX_WIDTH_FRACTION, MAX_POPUP_WIDTH_PX);
  const maxH = windowHeight * MAX_HEIGHT_FRACTION;
  const ratio = aspectRatio ?? DEFAULT_ASPECT_RATIO;
  const heightByWidth = maxW / ratio;
  if (heightByWidth <= maxH) {
    return { width: maxW, height: heightByWidth };
  }
  const widthByHeight = maxH * ratio;
  return { width: widthByHeight, height: maxH };
}

function PopupPromotionGateInner() {
  const router = useRouter();
  const theme = useThemeForStyled();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = Boolean(token && user);

  const dontShowPopupPromo = usePopupPromoStore((s) => s.dontShowPopupPromo);

  const { data: promosData } = useQuery({
    queryKey: ["promos"],
    queryFn: getPromos,
    enabled: isLoggedIn,
  });

  const popupPromos = useMemo(
    () => (promosData ?? []).filter((p: Promo) => p.type === "popup-promotion"),
    [promosData],
  );

  const [shouldShow, setShouldShow] = useState(false);
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const latestPopupPromo = useMemo(
    () => getLatestPromo(popupPromos),
    [popupPromos],
  );

  const openModalWithLatestPromo = useCallback(() => {
    if (
      !isLoggedIn ||
      popupPromos.length === 0 ||
      dontShowPopupPromo ||
      latestPopupPromo == null
    ) {
      return;
    }
    setShouldShow(true);
  }, [
    isLoggedIn,
    popupPromos.length,
    dontShowPopupPromo,
    latestPopupPromo,
  ]);

  // Cold start / first paint after login: app is already "active", so AppState never
  // fires inactive→active. Show the promo as soon as we have data and user is logged in.
  useEffect(() => {
    openModalWithLatestPromo();
  }, [
    latestPopupPromo?.id,
    openModalWithLatestPromo,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const becameActive =
        appStateRef.current.match(/inactive|background/) &&
        nextState === "active";
      appStateRef.current = nextState;
      if (
        isLoggedIn &&
        becameActive &&
        popupPromos.length > 0
      ) {
        openModalWithLatestPromo();
      }
    });
    return () => subscription.remove();
  }, [
    isLoggedIn,
    popupPromos.length,
    latestPopupPromo?.id,
    dontShowPopupPromo,
    openModalWithLatestPromo,
  ]);

  const handleRemindLater = useCallback(() => {
    setShouldShow(false);
  }, []);

  const handleImageLoad = useCallback(
    (event: { source: { width: number; height: number } }) => {
      const { width, height } = event.source;
      if (width > 0 && height > 0) {
        setImageAspectRatio(width / height);
      }
    },
    [],
  );

  const current = latestPopupPromo;

  const handlePromoPress = useCallback(() => {
    setShouldShow(false);
    if (current?.id) {
      router.push(`/(customer)/promo/${current.id}`);
    }
  }, [current?.id, router]);
  const imageUri = current?.thumbnail_url ?? null;
  useEffect(() => {
    if (!imageUri) setImageAspectRatio(null);
  }, [imageUri]);

  const popupSize = useMemo(
    () =>
      getPopupDimensions(windowWidth, windowHeight, imageAspectRatio),
    [windowWidth, windowHeight, imageAspectRatio]
  );

  if (!isLoggedIn || popupPromos.length === 0 || current == null) {
    return null;
  }

  return (
    <Modal
      visible={shouldShow}
      transparent
      animationType="fade"
      onRequestClose={handleRemindLater}
    >
      <ThemeProvider theme={theme}>
        <Backdrop onPress={handleRemindLater}>
          <Pressable onPress={handlePromoPress}>
            <ImageWrap
              $aspectRatio={imageAspectRatio}
              $width={popupSize.width}
              $height={popupSize.height}
            >
              {current.thumbnail_url ? (
                <RoundedImageClip>
                  <Image
                    source={{ uri: current.thumbnail_url }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="contain"
                    onLoad={handleImageLoad}
                  />
                </RoundedImageClip>
              ) : (
                <ImagePlaceholder>
                  <PlaceholderText type="caption">
                    Image not found
                  </PlaceholderText>
                </ImagePlaceholder>
              )}
            </ImageWrap>
          </Pressable>
          <RemindLaterBtn onPress={handleRemindLater}>
            <RemindLaterText type="defaultSemiBold">
              Remind me later
            </RemindLaterText>
          </RemindLaterBtn>
        </Backdrop>
      </ThemeProvider>
    </Modal>
  );
}

export function PopupPromotionGate() {
  return <PopupPromotionGateInner />;
}
