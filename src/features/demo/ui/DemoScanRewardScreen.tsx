import { useRewardsStore } from "@/features/rewards/zustand";
import { MOCK_REDEEMABLE_REWARDS } from "@/shared/lib/demo-data";
import { Spacing } from "@/shared/theme";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { PrimaryButton } from "@/shared/ui/button";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { ThemedText } from "@/shared/ui/themed-text";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { styled } from "styled-components/native";
import { Camera } from "@solar-icons/react-native/Broken";

const DEMO_CUSTOMER_HASH = "demo-hashed-id-customer";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const Content = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-top: ${({ theme }) => theme.spacing.xl};
  justify-content: center;
  align-items: center;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-vertical: ${({ theme }) => theme.spacing.lg};
  align-items: center;
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const PageTitle = styled(ThemedText)`
  margin-top: 0;
`;

const Message = styled(ThemedText)<{ $color?: string }>`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const PrimaryActionWrap = styled.View`
  width: 100%;
  align-items: center;
`;

export function DemoScanRewardScreen() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, "primary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const textMuted = useThemeColor({}, "textSecondary");
  const {
    setReedemableRewards,
    setCustomerHashId,
    setIsScanned,
  } = useRewardsStore();

  const handleDemoSimulateScan = useCallback(() => {
    setReedemableRewards(MOCK_REDEEMABLE_REWARDS);
    setCustomerHashId(DEMO_CUSTOMER_HASH);
    setIsScanned(true);
    router.replace("/(demo)/staff/(tabs)");
  }, [setReedemableRewards, setCustomerHashId, setIsScanned, router]);

  return (
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Demo: Scan reward</PageTitle>
          <ThemedText type="caption" style={{ color: textMuted }}>
            Simulate scanning a customer QR code.
          </ThemedText>
        </HeaderLeft>
      </HeaderRow>
      <Content>
        <Camera
          size={40}
          color={primaryColor}
          style={{ marginBottom: Spacing.xl }}
        />
        <Message type="subtitle" $color={textMuted}>
          In the full app you would scan the customer&apos;s QR code here. For
          demo, tap below to simulate a scan.
        </Message>
        <PrimaryActionWrap>
          <PrimaryButton
            onPress={handleDemoSimulateScan}
            leftIcon={<Camera size={20} color="#fff" />}
          >
            Simulate scan
          </PrimaryButton>
        </PrimaryActionWrap>
      </Content>
    </Container>
  );
}
