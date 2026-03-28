import React, { Suspense, useMemo } from "react";
import { ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import { styled } from "styled-components/native";

import { getTerms } from "@/features/terms/api";
import { wrapHtmlFragment } from "@/features/terms/wrap-html";
import { useColorScheme } from "@/shared/hooks/use-color-scheme";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { useSuspenseQuery } from "@tanstack/react-query";

const TERMS_QUERY_KEY = ["terms"] as const;

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

const WebViewContainer = styled.View`
  flex: 1;
`;

const StyledWebView = styled(WebView)`
  flex: 1;
  background-color: transparent;
`;

const LoadingWrap = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

function TermsContent() {
  const colorScheme = useColorScheme() ?? "light";
  const screenIconColor = useThemeColor({}, "screenIcon");
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  const { data: html } = useSuspenseQuery({
    queryKey: TERMS_QUERY_KEY,
    queryFn: getTerms,
  });

  const htmlSource = useMemo(
    () => ({ html: wrapHtmlFragment(html, colorScheme) }),
    [html, colorScheme],
  );

  return (
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Terms of Service</PageTitle>
          <ThemedText type="caption" style={{ color: textMuted }}>
            Read our terms and conditions.
          </ThemedText>
        </HeaderLeft>
      </HeaderRow>
      <WebViewContainer>
        <StyledWebView
          source={htmlSource}
          originWhitelist={["*"]}
          scrollEnabled
          showsVerticalScrollIndicator
          startInLoadingState
          renderLoading={() => (
            <LoadingWrap>
              <ActivityIndicator size="large" color={screenIconColor} />
            </LoadingWrap>
          )}
        />
      </WebViewContainer>
    </Container>
  );
}

function TermsOfServiceScreen() {
  return (
    <Suspense
      fallback={
        <Container>
          <LoadingWrap>
            <ActivityIndicator size="large" />
          </LoadingWrap>
        </Container>
      }
    >
      <TermsContent />
    </Suspense>
  );
}

export default TermsOfServiceScreen;
