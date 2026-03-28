import { CustomerRewards } from "@/features/rewards";
import { useRewardsStore } from "@/features/rewards/zustand";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { getFormattedDate } from "@/shared/lib/utils";
import { Shadows, Spacing } from "@/shared/theme";
import { PrimaryButton } from "@/shared/ui/button";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Star as StarBold } from "@solar-icons/react-native/Bold";
import { Gift } from "@solar-icons/react-native/Broken";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { styled } from "styled-components/native";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const Scroll = styled(ScrollViewWithRefresh)`
  flex: 1;
`;

const ScrollContent = styled.View`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-top: ${({ theme }) => theme.spacing.xl};
  padding-bottom: 112px;
`;

const Header = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const DateText = styled(ThemedText)<{ $color?: string }>`
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const PageTitle = styled(ThemedText)`
  margin-top: 0;
`;

const VerifySection = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const VerifyOptionsRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.md};
`;

const VerifyOptionButton = styled(TouchableOpacity).attrs(() => ({
  activeOpacity: 0.8,
}))<{
  $bg?: string;
  $flex?: number;
}>`
  flex: ${({ $flex }) => $flex ?? 1};
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: ${({ theme }) => theme.spacing.lg};
  padding-horizontal: ${({ theme }) => theme.spacing.md};
  border-radius: 20px;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  gap: ${({ theme }) => theme.spacing.sm};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : "elevation: 4;"}
`;

const VerifyOptionIconBox = styled.View<{ $bg?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
`;

const VerifyOptionText = styled(ThemedText)<{ $color?: string }>`
  font-size: 15px;
  font-family: Nunito_700Bold;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const SectionTitle = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const RewardCard = styled(View)<{
  $bg?: string;
}>`
  flex-direction: row;
  padding-vertical: ${({ theme }) => theme.spacing.lg};
  padding-horizontal: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.radii.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : "elevation: 3;"}
`;

const RewardContent = styled.View`
  flex: 1;
  min-width: 0;
`;

const RewardName = styled(ThemedText)`
  margin-bottom: 0;
`;

const RewardMetaRow = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;
`;

export default function RewardsScreen() {
  const router = useRouter();
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const accentYellow = useThemeColor({}, "accentYellow");
  const iconOnAccent = useThemeColor({}, "brownDark");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const cardBg = useThemeColor({}, "surface");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const { reedemableRewards, isScanned } = useRewardsStore();

  const handleClaimReward = (item: CustomerRewards["redeemable"][number]) => {
    router.push({
      pathname: "../reward-drinks",
      params: {
        rewardRuleId: String(item.id),
        rewardTitle: item.reward_title,
      },
    });
  };

  return (
    <Container>
      <Scroll skipDefaultRefresh showsVerticalScrollIndicator={false}>
        <ScrollContent>
          <Header>
            <HeaderLeft>
              <DateText type="caption" $color={textMuted}>
                {getFormattedDate()}
              </DateText>
              <PageTitle type="title">Rewards</PageTitle>
            </HeaderLeft>
          </Header>

          <VerifySection>
            <VerifyOptionsRow>
              <VerifyOptionButton
                onPress={() => router.push("/(staff)/scan-reward")}
                $bg={primaryColor}
              >
                <VerifyOptionIconBox $bg={accentYellow}>
                  <MaterialCommunityIcons
                    name="qrcode-scan"
                    size={24}
                    color={iconOnAccent}
                  />
                </VerifyOptionIconBox>
                <VerifyOptionText $color={cardOnDarkText}>
                  Scan QR
                </VerifyOptionText>
              </VerifyOptionButton>
              {/* <VerifyOptionButton
                onPress={() => router.push("/(staff)/scan-reward?mode=upload")}
                $bg={primaryColor}
              >
                <VerifyOptionIconBox $bg={accentYellow}>
                  <MaterialCommunityIcons
                    name="image-plus"
                    size={24}
                    color={iconOnAccent}
                  />
                </VerifyOptionIconBox>
                <VerifyOptionText $color={cardOnDarkText}>
                  Upload QR
                </VerifyOptionText>
              </VerifyOptionButton> */}
            </VerifyOptionsRow>
          </VerifySection>

          {isScanned && reedemableRewards?.length > 0 ? (
            <>
              <SectionTitle type="subtitle">Rewards</SectionTitle>
              {reedemableRewards.map((item) => (
                <RewardCard key={item.id} $bg={cardBg}>
                  <Gift
                    size={24}
                    color={screenIconColor}
                    style={{ marginRight: Spacing.md }}
                  />
                  <RewardContent>
                    <RewardName type="defaultSemiBold">
                      {item.reward_title}
                    </RewardName>
                    <ThemedText
                      type="caption"
                      style={{ color: textMuted, marginTop: 2 }}
                    >
                      {item.name}
                    </ThemedText>
                    <RewardMetaRow>
                      <StarBold size={12} color={accentYellow} />
                      <ThemedText type="caption" style={{ color: textMuted }}>
                        {item.points_required} pts
                        {/* {item.redeemable_count} available */}
                      </ThemedText>
                    </RewardMetaRow>
                    <PrimaryButton
                      size="small"
                      onPress={() => handleClaimReward(item)}
                      leftIcon={<Gift size={16} color={cardOnDarkText} />}
                    >
                      Claim
                    </PrimaryButton>
                  </RewardContent>
                </RewardCard>
              ))}
            </>
          ) : null}
        </ScrollContent>
      </Scroll>
    </Container>
  );
}
