import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { styled, useTheme } from "styled-components/native";

import { useAuthStore } from "@/features/auth/zustand";
import { ThemedText } from "@/shared/ui/themed-text";

import { BirthdayConfettiRain } from "./BirthdayConfettiRain";

const BROWN_BAND_HEIGHT = 170;

const Wrapper = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const Hero = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xxl};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  padding-top: ${({ theme }) => theme.spacing.xxl};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
  position: relative;
  ${Platform.OS === "ios"
    ? `
  shadow-color: rgba(0, 0, 0, 0.08);
  shadow-offset: 0px 4px;
  shadow-opacity: 1;
  shadow-radius: 8px;
`
    : "elevation: 3;"}
`;

const BrownBandWrap = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${BROWN_BAND_HEIGHT}px;
  z-index: 0;
`;

const HeroForeground = styled.View`
  position: relative;
  z-index: 2;
  align-items: center;
`;

const GiftEmoji = styled.Text`
  font-size: 76px;
  line-height: 84px;
  text-align: center;
  margin-bottom: 32px;
`;

const HeroTitle = styled(ThemedText)`
  text-align: center;
  font-size: 22px;
  line-height: 28px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-top: 24px;
  margin-bottom: 4px;
`;

const HeroSubtitle = styled(ThemedText)`
  text-align: center;
  font-size: 13px;
  line-height: 18px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ClaimButton = styled(Pressable)`
  margin-top: ${({ theme }) => theme.spacing.lg};
  align-self: stretch;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.radii.md};
  padding-vertical: 12px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  justify-content: center;
`;

const ClaimButtonText = styled(ThemedText)`
  font-size: 15px;
  font-family: ${({ theme }) => theme.typography.fontFamily.bold};
  color: ${({ theme }) => theme.colors.primaryFg};
`;

/** Filled rectangle with a multi-bump wavy bottom edge, scaled to fit the band. */
function BrownWaveBand({ color }: { color: string }) {
  // viewBox is 400 wide; flat top, then a smooth wave between y=130 and y=160.
  // Using cubic curves so the dip/crest line up nicely across the width.
  const path =
    "M0,0 " +
    "L400,0 " +
    "L400,130 " +
    "C350,170 300,120 250,140 " +
    "C200,160 150,110 100,140 " +
    "C50,160 25,130 0,150 " +
    "Z";
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={`0 0 400 ${BROWN_BAND_HEIGHT}`}
      preserveAspectRatio="none"
    >
      <Path d={path} fill={color} />
    </Svg>
  );
}

export function BirthdayRewardCard() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isBirthdayToday = user?.is_birthday_today ?? false;

  if (!isBirthdayToday) return null;

  const firstName = (user?.name ?? "").trim().split(/\s+/)[0] || "there";

  return (
    <Wrapper>
      <Hero>
        <BrownBandWrap pointerEvents="none">
          <BrownWaveBand color={theme.colors.primary} />
        </BrownBandWrap>
        <BirthdayConfettiRain />
        <HeroForeground>
          <GiftEmoji accessibilityRole="image" accessibilityLabel="Gift">
            🎁
          </GiftEmoji>
          <HeroTitle type="default">Happy Birthday, {firstName}! 🎉</HeroTitle>
          <HeroSubtitle type="default">
            To celebrate your special day, we have given you a birthday reward.
            Valid for 7 days — redeem it now and enjoy your day! 🎂🎁
          </HeroSubtitle>
          <ClaimButton
            accessibilityRole="button"
            accessibilityLabel="Claim birthday reward"
            onPress={() => router.push("/(customer)/(tabs)/profile")}
          >
            <ClaimButtonText type="default">Claim Reward</ClaimButtonText>
          </ClaimButton>
        </HeroForeground>
      </Hero>
    </Wrapper>
  );
}
