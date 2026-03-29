import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { styled } from "styled-components/native";

import { getPromoById } from "@/features/promos/api";
import type { Promo } from "@/features/promos/types";
import { useColorScheme } from "@/shared/hooks/use-color-scheme";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { Spacing } from "@/shared/theme";
import { SurfaceCard } from "@/shared/ui/card";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { PrimaryButton } from "@/shared/ui/button";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { Tag, UserSpeak } from "@solar-icons/react-native/Broken";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { PromoDetailSkeleton } from "./PromoDetailSkeleton";

dayjs.extend(relativeTime);

const PROMO_QUERY_KEY = (id: string) => ["promo", id] as const;

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

const PageTitle = styled(ThemedText)`
  margin-top: 0;
  margin-bottom: 2px;
`;

const Scroll = styled(ScrollViewWithRefresh)`
  flex: 1;
`;

const ScrollContent = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const PostCard = styled(SurfaceCard)<{ $visible?: boolean }>`
  opacity: ${({ $visible }) => ($visible === false ? 0 : 1)};
  pointer-events: ${({ $visible }) => ($visible === false ? "none" : "auto")};
`;

const PostHeader = styled.View`
  flex-direction: row;
  align-items: center;
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

const PostImageWrap = styled(Pressable)<{ $bg?: string }>`
  width: 100%;
  min-height: 120px;
  aspect-ratio: 16/9;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
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

const FullImageCloseBtn = styled(TouchableOpacity).attrs(() => ({
  activeOpacity: 0.8,
}))<{ $bg?: string }>`
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

const DetailImage = styled(Image)`
  width: 100%;
  height: 100%;
`;

const PostBody = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
`;

const WebViewWrap = styled.View<{ $height?: number }>`
  ${({ $height }) => ($height != null ? `height: ${$height}px;` : "")}
`;

const ContentWebView = styled(WebView)<{ $height?: number }>`
  ${({ $height }) => ($height != null ? `height: ${$height}px;` : "")}
  background-color: transparent;
`;

const CardOverlay = styled.View<{ $visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? "auto" : "none")};
`;

const PostMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ContentColumn = styled.View`
  position: relative;
`;

const MessageColumn = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  justify-content: center;
  align-items: center;
`;

const MessageTitle = styled(ThemedText)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const MessageBody = styled(ThemedText)<{ $color: string }>`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ $color }) => $color};
`;

function isNotFoundError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 404;
}

function buildContentHtml(
  content: string,
  textColor: string,
  primaryColor: string,
  backgroundColor: string,
  colorScheme: "light" | "dark",
): string {
  const bodyStyle = [
    "font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    "font-size: 16px",
    "line-height: 24px",
    `color: ${textColor}`,
    `background-color: ${backgroundColor}`,
    "margin: 0",
    "padding: 8px 0",
  ].join("; ");
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"><meta name="color-scheme" content="${colorScheme}" /><style>html,body{${bodyStyle}} *{background-color:transparent !important;} a,a *{color:${primaryColor} !important;}</style></head><body>${content || ""}<script>(function(){var textColor='${textColor}';var linkColor='${primaryColor}';function applyColor(el){if(!el||!(el instanceof Element))return;var isLink=el.tagName==='A'||!!el.closest('a');el.style.removeProperty('color');el.style.removeProperty('background');el.style.removeProperty('background-color');el.style.removeProperty('-webkit-text-fill-color');el.style.removeProperty('text-fill-color');if(!isLink){el.style.setProperty('color',textColor,'important');el.style.setProperty('-webkit-text-fill-color',textColor,'important');}else{el.style.setProperty('color',linkColor,'important');el.style.setProperty('-webkit-text-fill-color',linkColor,'important');}}function sanitize(){applyColor(document.body);var all=document.body?document.body.querySelectorAll('*'):[];for(var i=0;i<all.length;i+=1){applyColor(all[i]);}}sanitize();setTimeout(sanitize,0);setTimeout(sanitize,200);})();</script></body></html>`;
}

function PromoDetailBody({
  promo,
  onRefresh,
}: {
  promo: Promo;
  onRefresh: () => Promise<void>;
}) {
  const { width, height } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? "light";
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const cardBg = useThemeColor({}, "surface");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const textColor = useThemeColor({}, "text");
  const [fullImageUri, setFullImageUri] = useState<string | null>(null);

  const [webViewReady, setWebViewReady] = useState(false);
  const [webViewHeight, setWebViewHeight] = useState<number | undefined>(
    undefined,
  );
  useEffect(() => {
    setWebViewReady(false);
    setWebViewHeight(undefined);
  }, [promo.id]);

  const injectedJavaScript = useMemo(
    () => `
    (function() {
      function sendHeight() {
        var height = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        );
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', value: height }));
      }
      sendHeight();
      setTimeout(sendHeight, 300);
      setTimeout(sendHeight, 800);
    })();
    true;
  `,
    [],
  );
  const htmlSource = useMemo(
    () => ({
      html: buildContentHtml(
        promo.content || "",
        textColor,
        primaryColor,
        cardBg,
        colorScheme,
      ),
    }),
    [promo.content, textColor, primaryColor, cardBg, colorScheme],
  );

  return (
    <Container>
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
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Overview</PageTitle>
          <ThemedText type="caption" style={{ color: textMuted }}>
            About this {promo.type === "announcement" ? "update" : "deal"}
          </ThemedText>
        </HeaderLeft>
      </HeaderRow>
      <Scroll
        showsVerticalScrollIndicator={false}
        refreshTintColor={primaryColor}
        onRefresh={onRefresh}
      >
        <ScrollContent>
          <ContentColumn>
            <PostCard $visible={webViewReady} $padding={Spacing.xs}>
              <PostHeader>
                <PostHeaderText>
                  <PostTitle type="defaultSemiBold">{promo.title}</PostTitle>
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
              </PostHeader>

              {promo.thumbnail_url ? (
                <PostImageWrap
                  $bg={surfaceElevated}
                  onPress={() => setFullImageUri(promo.thumbnail_url)}
                >
                  <DetailImage
                    source={{ uri: promo.thumbnail_url }}
                    contentFit="cover"
                  />
                </PostImageWrap>
              ) : null}
              <PostBody>
                <WebViewWrap $height={webViewHeight}>
                  <ContentWebView
                    source={htmlSource}
                    originWhitelist={["*"]}
                    scrollEnabled={false}
                    injectedJavaScript={injectedJavaScript}
                    onMessage={(e) => {
                      try {
                        const payload = JSON.parse(e.nativeEvent.data) as {
                          type?: string;
                          value?: number;
                        };
                        if (
                          payload.type === "height" &&
                          typeof payload.value === "number" &&
                          payload.value > 0
                        ) {
                          setWebViewHeight(payload.value);
                        }
                      } catch {
                        // ignore parse errors
                      }
                    }}
                    onLoadEnd={() => setWebViewReady(true)}
                    $height={webViewHeight}
                  />
                </WebViewWrap>
              </PostBody>
            </PostCard>

            <CardOverlay $visible={!webViewReady}>
              <PromoDetailSkeleton />
            </CardOverlay>
          </ContentColumn>
        </ScrollContent>
      </Scroll>
    </Container>
  );
}

function PromoDetailContent() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  const promoQuery = useQuery({
    queryKey: [...PROMO_QUERY_KEY(id ?? "")],
    queryFn: () => getPromoById(id!),
    enabled: Boolean(id),
    retry: (failureCount, error) => {
      if (isNotFoundError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (!id) {
      router.back();
    }
  }, [id, router]);

  if (!id) {
    return null;
  }

  if (promoQuery.isPending) {
    return (
      <Container>
        <HeaderRow>
          <HeaderBackButton
            backgroundColor={primaryColor}
            iconColor={cardOnDarkText}
          />
          <HeaderLeft>
            <PageTitle type="title">Overview</PageTitle>
            <ThemedText type="caption" style={{ color: textMuted }}>
              Loading…
            </ThemedText>
          </HeaderLeft>
        </HeaderRow>
        <Scroll
          showsVerticalScrollIndicator={false}
          refreshTintColor={primaryColor}
          onRefresh={async () => {
            await promoQuery.refetch();
          }}
        >
          <ScrollContent>
            <PromoDetailSkeleton />
          </ScrollContent>
        </Scroll>
      </Container>
    );
  }

  if (promoQuery.isError) {
    const notFound = isNotFoundError(promoQuery.error);
    return (
      <Container>
        <HeaderRow>
          <HeaderBackButton
            backgroundColor={primaryColor}
            iconColor={cardOnDarkText}
          />
          <HeaderLeft>
            <PageTitle type="title">Overview</PageTitle>
            <ThemedText type="caption" style={{ color: textMuted }}>
              {notFound ? "No longer available" : "Something went wrong"}
            </ThemedText>
          </HeaderLeft>
        </HeaderRow>
        <MessageColumn>
          <MessageTitle type="title">
            {notFound ? "This promotion was removed" : "Could not load promotion"}
          </MessageTitle>
          <MessageBody type="default" $color={textMuted}>
            {notFound
              ? "It may have ended or been taken down. Browse current deals on the Promos tab."
              : "Check your connection and try again."}
          </MessageBody>
          {notFound ? (
            <PrimaryButton
              onPress={() => router.replace("/(customer)/(tabs)/promos")}
            >
              View promos
            </PrimaryButton>
          ) : (
            <PrimaryButton onPress={() => void promoQuery.refetch()}>
              Retry
            </PrimaryButton>
          )}
        </MessageColumn>
      </Container>
    );
  }

  return (
    <PromoDetailBody
      promo={promoQuery.data}
      onRefresh={async () => {
        await promoQuery.refetch();
      }}
    />
  );
}

function PromoDetailScreen() {
  return <PromoDetailContent />;
}

export default PromoDetailScreen;
