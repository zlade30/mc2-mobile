import { StarsMinimalistic } from "@solar-icons/react-native/Bold";
import React, { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView } from "react-native";
import {
  initialWindowMetrics,
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { styled, ThemeProvider } from "styled-components/native";

import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { useThemeForStyled } from "@/shared/store";
import { Spacing } from "@/shared/theme/spacing";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { ThemedText } from "@/shared/ui/themed-text";

import { BirthdayConfettiRain } from "./BirthdayConfettiRain";

/** Pixels the reward card overlaps upward into the hero; keep subtitle above this band. */
const REWARD_CARD_OVERLAP_PX = 56;

const Root = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Scroll = styled(ScrollView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ScrollInner = styled.View`
  flex-grow: 1;
  padding-bottom: ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.background};
`;

const HeaderRow = styled.View`
  flex-direction: row;
  align-items: flex-start;
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

const Hero = styled.View`
  margin-horizontal: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.primary};
  border-top-left-radius: ${({ theme }) => theme.radii.xl};
  border-top-right-radius: ${({ theme }) => theme.radii.xl};
  padding-top: ${({ theme }) => theme.spacing.xxl};
  /* Reserve space so the last line of copy stays above the overlapping reward card */
  padding-bottom: ${Spacing.xxxl + REWARD_CARD_OVERLAP_PX + Spacing.lg}px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
  min-height: 260px;
  position: relative;
`;

const HeroForeground = styled.View`
  position: relative;
  z-index: 1;
`;

const GiftWrap = styled.View`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

/** Large hero emoji; font-size drives visual weight (larger than previous 112px icon). */
const GiftEmojiText = styled.Text`
  font-size: 120px;
  line-height: 130px;
  text-align: center;
`;

const HeroTitle = styled(ThemedText)`
  text-align: center;
  font-size: 22px;
  line-height: 28px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  color: ${({ theme }) => theme.colors.primaryFg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const HeroSubtitle = styled(ThemedText)`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: ${({ theme }) => theme.typography.bodyLineHeight}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
  color: ${({ theme }) => theme.colors.primaryFg};
  opacity: 0.95;
`;

/** One light panel overlapping the hero: reward summary, details, actions, footer. */
const SheetBodyPanel = styled.View`
  margin-horizontal: ${({ theme }) => theme.spacing.lg};
  margin-top: -${REWARD_CARD_OVERLAP_PX}px;
  z-index: 1;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  shadow-color: ${({ theme }) => theme.colors.brownDark};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 4;
`;

const RewardSummaryRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const GoldCircle = styled.View`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${({ theme }) => theme.colors.accentYellow};
  align-items: center;
  justify-content: center;
`;

const CardTextCol = styled.View`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const CardKicker = styled(ThemedText)`
  font-size: 11px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const CardHeadline = styled(ThemedText)`
  font-size: 22px;
  line-height: 28px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  color: ${({ theme }) => theme.colors.text};
`;

const CardBody = styled(ThemedText)`
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: ${({ theme }) => theme.typography.bodyLineHeight}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetailsBlock = styled.View`
  gap: ${({ theme }) => theme.spacing.lg};
`;

const DetailRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
`;

const DetailLabel = styled(ThemedText)`
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: ${({ theme }) => theme.typography.fontFamily.regular};
`;

const DetailValue = styled(ThemedText)`
  flex: 1;
  text-align: right;
  font-size: ${({ theme }) => theme.typography.body}px;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.typography.fontFamily.semiBold};
`;

const Actions = styled.View`
  margin-top: ${({ theme }) => theme.spacing.xxxl};
  gap: ${({ theme }) => theme.spacing.md};
`;

const PrimaryBtn = styled(Pressable)`
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding-vertical: ${({ theme }) => theme.spacing.md};
  align-items: center;
  justify-content: center;
`;

const PrimaryBtnText = styled(ThemedText)`
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  color: ${({ theme }) => theme.colors.primaryFg};
`;

const SecondaryBtn = styled(Pressable)`
  border-width: 2px;
  border-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding-vertical: ${({ theme }) => theme.spacing.md};
  align-items: center;
  justify-content: center;
  background-color: transparent;
`;

const SecondaryBtnText = styled(ThemedText)`
  font-size: ${({ theme }) => theme.typography.subtitle}px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  color: ${({ theme }) => theme.colors.primary};
`;

const FooterNote = styled(ThemedText)`
  margin-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

function BirthdayRewardSheetModalInner() {
  const theme = useThemeForStyled();
  const primaryColor = useThemeColor({}, "primary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const [visible, setVisible] = useState(true);

  const close = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={false}
      onRequestClose={close}
    >
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ThemeProvider theme={theme}>
          <Root edges={["top", "bottom", "left", "right"]}>
            <Scroll
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <ScrollInner>
                <HeaderRow>
                  <HeaderBackButton
                    onPress={close}
                    backgroundColor={primaryColor}
                    iconColor={cardOnDarkText}
                  />
                  <HeaderLeft>
                    <PageTitle type="title">Birthday Reward</PageTitle>
                  </HeaderLeft>
                </HeaderRow>

                <Hero>
                  <BirthdayConfettiRain />
                  <HeroForeground>
                    <GiftWrap>
                      <GiftEmojiText
                        accessibilityRole="image"
                        accessibilityLabel="Gift"
                      >
                        🎁
                      </GiftEmojiText>
                    </GiftWrap>
                    <HeroTitle type="default">
                      Happy Birthday, Grache! 🎉
                    </HeroTitle>
                    <HeroSubtitle type="default">
                      Here’s a little something for you.
                    </HeroSubtitle>
                  </HeroForeground>
                </Hero>

                <SheetBodyPanel>
                  <RewardSummaryRow>
                    <GoldCircle>
                      <StarsMinimalistic
                        size={28}
                        color={theme.colors.primary}
                      />
                    </GoldCircle>
                    <CardTextCol>
                      <CardKicker type="default">
                        Your birthday reward
                      </CardKicker>
                      <CardHeadline type="default">
                        10 Bonus Points
                      </CardHeadline>
                      <CardBody type="default">
                        Enjoy your 1 free drink from us!
                      </CardBody>
                    </CardTextCol>
                  </RewardSummaryRow>

                  <DetailsBlock>
                    <DetailRow>
                      <DetailLabel type="default">Valid until</DetailLabel>
                      <DetailValue type="default">
                        May 14, 2026 (14 days)
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel type="default">Reward ID</DetailLabel>
                      <DetailValue type="default">
                        BRD-2026-0430-001
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel type="default">Auto-issued on</DetailLabel>
                      <DetailValue type="default">April 30, 2026</DetailValue>
                    </DetailRow>
                  </DetailsBlock>

                  <Actions>
                    <PrimaryBtn
                      accessibilityRole="button"
                      accessibilityLabel="Redeem now"
                    >
                      <PrimaryBtnText type="default">Redeem Now</PrimaryBtnText>
                    </PrimaryBtn>
                    <SecondaryBtn
                      accessibilityRole="button"
                      accessibilityLabel="View rewards"
                    >
                      <SecondaryBtnText type="default">
                        View Rewards
                      </SecondaryBtnText>
                    </SecondaryBtn>
                  </Actions>

                  <FooterNote type="caption">
                    This reward can be used only once.
                  </FooterNote>
                </SheetBodyPanel>
              </ScrollInner>
            </Scroll>
          </Root>
        </ThemeProvider>
      </SafeAreaProvider>
    </Modal>
  );
}

export function BirthdayRewardSheetModal() {
  return <BirthdayRewardSheetModalInner />;
}
