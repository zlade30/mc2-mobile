import { Image } from "expo-image";
import { MOCK_PROMOS } from "@/shared/lib/demo-data";
import { useColorScheme } from "@/shared/hooks/use-color-scheme";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { Spacing } from "@/shared/theme";
import { SurfaceCard } from "@/shared/ui/card";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import {
  Tag,
  UserSpeak,
} from "@solar-icons/react-native/Broken";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import { WebView } from "react-native-webview";
import { styled } from "styled-components/native";

dayjs.extend(relativeTime);

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

const PostCard = styled(SurfaceCard)`
  padding: ${({ theme }) => theme.spacing.xs};
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

const PostMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PostImageWrap = styled.View<{ $bg?: string }>`
  width: 100%;
  min-height: 120px;
  aspect-ratio: 16/9;
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

export function DemoPromoDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id ?? "";
  const promo = MOCK_PROMOS.find((p) => p.id === id) ?? MOCK_PROMOS[0];
  const colorScheme = useColorScheme() ?? "light";
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const cardBg = useThemeColor({}, "surface");
  const textColor = useThemeColor({}, "text");
  const [webViewHeight, setWebViewHeight] = useState<number | undefined>(
    undefined,
  );

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
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
          promoDetailFallbackRoute="/(demo)/customer/(tabs)/promos"
        />
        <HeaderLeft>
          <PageTitle type="title">Overview</PageTitle>
          <ThemedText type="caption" style={{ color: textMuted }}>
            About this {promo.type === "announcement" ? "update" : "deal"}
          </ThemedText>
        </HeaderLeft>
      </HeaderRow>
      <Scroll showsVerticalScrollIndicator={false} onRefresh={async () => {}}>
        <ScrollContent>
          <PostCard $padding={Spacing.xs}>
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
              <PostImageWrap $bg={surfaceElevated}>
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
                      // ignore
                    }
                  }}
                  $height={webViewHeight}
                />
              </WebViewWrap>
            </PostBody>
          </PostCard>
        </ScrollContent>
      </Scroll>
    </Container>
  );
}
