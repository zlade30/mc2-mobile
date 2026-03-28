import { useAuthStore } from "@/features/auth/zustand";
import { useNotificationsStore } from "@/features/notifications/store";
import { rewardsStore } from "@/features/rewards/zustand";
import { MOCK_CUSTOMER_REWARDS } from "@/shared/lib/demo-data";
import { useBiometricStore, useNotificationBadgeStore } from "@/shared/store";
import { isBiometricAvailable } from "@/shared/lib/biometric";
import { isPinSet } from "@/shared/lib/pin";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { Spacing } from "@/shared/theme";
import { PrimaryButton } from "@/shared/ui/button";
import { SurfaceCard } from "@/shared/ui/card";
import { ListRow } from "@/shared/ui/list-row";
import { NotificationHeaderIcon } from "@/shared/ui/notification-header-icon";
import { ScrollViewWithRefresh } from "@/shared/ui/scroll-view-with-refresh";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { getFormattedDate } from "@/shared/lib/utils";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  CalendarMinimalistic,
  DocumentText,
  FaceScanSquare,
  Gift,
  Letter,
  Password,
  Star,
  UserCross,
} from "@solar-icons/react-native/Broken";
import dayjs from "dayjs";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Switch } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { styled, useTheme } from "styled-components/native";

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const Scroll = styled(ScrollViewWithRefresh)`
  flex: 1;
`;

const ScrollContent = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
`;

const Header = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const HeaderTop = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const DateText = styled(ThemedText)<{ $color?: string }>`
  letter-spacing: 0.5px;
  font-size: 11px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const Title = styled(ThemedText)`
  margin-top: 4px;
`;

const QrCard = styled.View<{ $bg?: string; $opacity?: number }>`
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.xxl};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  align-items: center;
  background-color: ${({ $bg }) => $bg ?? "transparent"};
  opacity: ${({ $opacity }) => $opacity ?? 1};
`;

const QrCardTitle = styled(ThemedText)`
  color: #f5f0e8;
  font-size: 12px;
  letter-spacing: 1.2px;
  font-family: Nunito_700Bold;
  align-self: flex-start;
  margin-bottom: 4px;
`;

const QrCardHint = styled(ThemedText)`
  color: #e8ddd4;
  font-size: 14px;
  align-self: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const QrCardName = styled(ThemedText)`
  color: #f5f0e8;
  font-size: 18px;
  font-family: Nunito_700Bold;
  align-self: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const QrWrapper = styled.View<{ $bg?: string }>`
  background-color: ${({ $bg }) => $bg ?? "#fff"};
  padding: 16px;
  border-radius: ${({ theme }) => theme.radii.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const BadgesRow = styled.View`
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const SectionTitle = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const QrPlaceholder = styled.View`
  width: 200px;
  height: 200px;
`;

export function DemoProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  const theme = useTheme();
  const { showConfirm, modalState, hide, getState } = useLocalBottomModal();
  const biometricEnabled = useBiometricStore((state) => state.biometricEnabled);
  const setBiometricEnabled = useBiometricStore(
    (state) => state.setBiometricEnabled,
  );
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    isBiometricAvailable().then((available) => {
      if (!cancelled) setBiometricAvailable(available);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user?.name ?? "CUSTOMER_NAME";
  const hashedId = user?.hashed_id ?? "";
  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const textMuted = useThemeColor({}, "textSecondary");
  const brownDark = useThemeColor({}, "brownDark");
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "successGreen");
  const errorColor = theme.colors.error;
  const rewardsCount = MOCK_CUSTOMER_REWARDS.redeemable?.length ?? 0;

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
            router.push("/(demo)/customer/set-pin");
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
      onConfirm: () => {
        rewardsStore.getState().reset();
        useNotificationsStore.getState().clearAllNotifications();
        useNotificationBadgeStore.getState().clearNotifications();
        clearAuth();
        setTimeout(() => router.replace("/(auth)/login"), 0);
      },
    });
  };

  return (
    <Container edges={["top", "left", "right"]}>
      <Scroll showsVerticalScrollIndicator={false}>
        <ScrollContent>
          <Header>
            <HeaderTop>
              <DateText type="caption" $color={textMuted}>
                {getFormattedDate()}
              </DateText>
              <NotificationHeaderIcon inline />
            </HeaderTop>
            <Title type="title">Profile</Title>
          </Header>

          <QrCard $bg={primaryColor}>
            <QrCardTitle>LOYALTY QR CODE</QrCardTitle>
            <QrCardHint>
              Show this at checkout to earn points or redeem rewards
            </QrCardHint>
            <QrCardName>{displayName}</QrCardName>
            <QrWrapper>
              {hashedId ? (
                <QRCode value={hashedId} size={200} color={brownDark} />
              ) : (
                <QrPlaceholder />
              )}
            </QrWrapper>
          </QrCard>

          <SectionTitle type="subtitle">Account</SectionTitle>
          <SurfaceCard $padding={Spacing.sm}>
            <ListRow
              left={<Letter size={22} color={screenIconColor} />}
              title="Email"
              subtitle={user?.email ?? ""}
              right={
                <BadgesRow>
                  <MaterialCommunityIcons
                    name={
                      user?.email_verified_at ? "check-circle" : "close-circle"
                    }
                    size={16}
                    color={user?.email_verified_at ? successColor : errorColor}
                  />
                  <ThemedText
                    type="caption"
                    style={{
                      color: user?.email_verified_at
                        ? successColor
                        : errorColor,
                    }}
                  >
                    {user?.email_verified_at ? "Verified" : "Not verified"}
                  </ThemedText>
                </BadgesRow>
              }
              showBorder
            />
            <ListRow
              left={<Star size={22} color={screenIconColor} />}
              title="Points"
              right={
                <ThemedText type="caption" style={{ color: textColor }}>
                  {user?.loyalty_point?.total_points ?? 0}
                </ThemedText>
              }
              showBorder
            />
            <ListRow
              left={<Gift size={22} color={screenIconColor} />}
              title="Rewards"
              right={
                <ThemedText type="caption" style={{ color: textColor }}>
                  {rewardsCount}
                </ThemedText>
              }
              showBorder
            />
            <ListRow
              left={<CalendarMinimalistic size={22} color={screenIconColor} />}
              title="Member since"
              right={
                <ThemedText type="caption" style={{ color: textMuted }}>
                  {dayjs(user?.created_at).format("YYYY")}
                </ThemedText>
              }
              showBorder
            />
            <ListRow
              onPress={() => void handleAppLockToggle(!biometricEnabled)}
              left={
                <FaceScanSquare size={22} color={screenIconColor} />
              }
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
              onPress={() => router.push("/(demo)/customer/terms-of-service")}
              left={<DocumentText size={22} color={screenIconColor} />}
              title="Terms of Service"
              subtitle="View terms"
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
              onPress={() => router.push("/(demo)/customer/change-password")}
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
              onPress={() => router.push("/(demo)/customer/delete-account")}
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

          <SectionTitle type="subtitle">Appearance</SectionTitle>
          <SurfaceCard>
            <ThemeToggle variant="segmented" label="Theme" />
          </SurfaceCard>
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
