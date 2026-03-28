import { useAuthStore } from "@/features/auth/zustand";
import { rewardsStore } from "@/features/rewards/zustand";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { isBiometricAvailable } from "@/shared/lib/biometric";
import { isPinSet } from "@/shared/lib/pin";
import { getFormattedDate } from "@/shared/lib/utils";
import { useBiometricStore } from "@/shared/store";
import { Shadows, Spacing } from "@/shared/theme";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { PrimaryButton } from "@/shared/ui/button";
import { SurfaceCard } from "@/shared/ui/card";
import { ListRow } from "@/shared/ui/list-row";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  FaceScanSquare,
  Password,
  UserCross,
} from "@solar-icons/react-native/Broken";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Platform, Switch } from "react-native";
import { styled, useTheme } from "styled-components/native";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const Scroll = styled(ScrollViewWithRefresh)`
  flex: 1;
`;

const ScrollContent = styled.View<{
  $paddingTop?: number;
  $paddingBottom?: number;
}>`
  flex: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-top: ${({ $paddingTop, theme }) =>
    $paddingTop != null ? `${$paddingTop}px` : theme.spacing.xl};
  padding-bottom: ${({ $paddingBottom }) =>
    $paddingBottom != null ? `${$paddingBottom}px` : "32px"};
`;

const Header = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const DateText = styled(ThemedText)<{ $color?: string }>`
  letter-spacing: 0.5px;
  font-size: 11px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const Title = styled(ThemedText)`
  margin-top: 4px;
`;

const Card = styled.View<{ $bg?: string }>`
  padding-vertical: ${({ theme }) => theme.spacing.xl};
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radii.xl};
  background-color: ${({ $bg, theme }) => $bg ?? theme.colors.surface};
  ${Platform.OS === "ios"
    ? `
  shadow-color: ${Shadows.chunky.shadowColor};
  shadow-offset: ${Shadows.chunky.shadowOffset.width}px ${Shadows.chunky.shadowOffset.height}px;
  shadow-opacity: ${Shadows.chunky.shadowOpacity};
  shadow-radius: ${Shadows.chunky.shadowRadius}px;
`
    : "elevation: 3;"}
`;

const StaffRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Avatar = styled.View<{ $bg?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  align-items: center;
  justify-content: center;
  margin-right: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ $bg, theme }) => $bg ?? "transparent"};
`;

const AvatarText = styled(ThemedText)`
  color: #f5f0e8;
  font-size: 20px;
  font-family: Nunito_700Bold;
`;

const StaffInfo = styled.View`
  flex: 1;
`;

const StaffName = styled(ThemedText)`
  margin-bottom: 2px;
`;

const SectionTitle = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const STAFF_EMAIL_PLACEHOLDER = "staff@sample.com";

export default function ProfileScreen() {
  const { user, clearAuth, fcmToken } = useAuthStore();
  const router = useRouter();
  const theme = useTheme();
  const primaryColor = useThemeColor({}, "primary");
  const textMuted = useThemeColor({}, "textSecondary");
  const surfaceColor = useThemeColor({}, "surface");
  const { showConfirm, modalState, hide, getState } = useLocalBottomModal();

  const displayName = user?.name ?? "";
  const email = user?.email ?? STAFF_EMAIL_PLACEHOLDER;

  const biometricEnabled = useBiometricStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useBiometricStore(
    (state) => state.setBiometricEnabled,
  );
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(
    null,
  );
  const screenIconColor = useThemeColor({}, "screenIcon");

  useEffect(() => {
    let cancelled = false;
    isBiometricAvailable().then((available) => {
      if (!cancelled) setBiometricAvailable(available);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAppLockToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        const availableNow =
          biometricAvailable === null
            ? await isBiometricAvailable()
            : biometricAvailable;
        if (!availableNow) {
          const pinSet = await isPinSet();
          if (!pinSet) {
            router.push("/(staff)/set-pin");
            return;
          }
        }
      }
      setBiometricEnabled(value);
    },
    [biometricAvailable, router, setBiometricEnabled],
  );

  const handleLogout = () => {
    showConfirm({
      title: "Sign out",
      message: "Are you sure you want to sign out?",
      cancelText: "Cancel",
      confirmText: "Sign out",
      destructive: true,
      keepOpenOnConfirm: true,
      onConfirm: async () => {
        rewardsStore.getState().reset();
        clearAuth();
        router.replace("/(auth)/login");
      },
    });
  };

  return (
    <Container>
      <Scroll skipDefaultRefresh showsVerticalScrollIndicator={false}>
        <ScrollContent $paddingTop={Spacing.xl} $paddingBottom={32 + 80}>
          <Header>
            <DateText type="caption" $color={textMuted}>
              {getFormattedDate()}
            </DateText>
            <Title type="title">Profile</Title>
          </Header>

          {/* Profile info card */}
          <Card $bg={surfaceColor}>
            <StaffRow>
              <Avatar $bg={primaryColor}>
                <AvatarText>{displayName.charAt(0).toUpperCase()}</AvatarText>
              </Avatar>
              <StaffInfo>
                <StaffName type="defaultSemiBold">{displayName}</StaffName>
                <ThemedText
                  type="caption"
                  style={{ color: textMuted }}
                  numberOfLines={1}
                >
                  {email}
                </ThemedText>
              </StaffInfo>
            </StaffRow>
          </Card>

          {/* Account */}
          <SectionTitle type="subtitle">Account</SectionTitle>
          <SurfaceCard $padding={Spacing.sm}>
            <ListRow
              onPress={() => void handleAppLockToggle(!biometricEnabled)}
              left={<FaceScanSquare size={22} color={screenIconColor} />}
              title="App lock"
              subtitle={
                biometricAvailable === true
                  ? "Unlock with Face ID, fingerprint, or PIN"
                  : "Unlock with PIN"
              }
              right={
                <Switch
                  value={biometricEnabled}
                  onValueChange={(v) => void handleAppLockToggle(v)}
                  trackColor={{
                    false: theme.colors.border,
                    true: primaryColor,
                  }}
                  thumbColor="#fff"
                />
              }
              showBorder
            />
            <ListRow
              onPress={() => router.push("/(staff)/change-password")}
              left={<Password size={22} color={screenIconColor} />}
              title="Change password"
              subtitle="Update your password"
              right={
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={textMuted}
                />
              }
              showBorder
            />
            <ListRow
              onPress={() => router.push("/(staff)/delete-account")}
              left={<UserCross size={22} color={screenIconColor} />}
              title="Delete account"
              subtitle="Permanently delete your account"
              right={
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={24}
                  color={textMuted}
                />
              }
            />
          </SurfaceCard>

          {/* Appearance */}
          <Card $bg={surfaceColor}>
            <SectionTitle type="subtitle">Appearance</SectionTitle>
            <ThemeToggle variant="segmented" label="Light / Dark" />
          </Card>

          <PrimaryButton
            onPress={handleLogout}
            leftIcon={
              <MaterialCommunityIcons
                name="logout"
                size={20}
                color={theme.colors.primaryFg}
              />
            }
          >
            Sign out
          </PrimaryButton>
        </ScrollContent>
      </Scroll>
      <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </Container>
  );
}
