import { deleteAccount } from "@/features/auth/api";
import {
  deleteAccountSchema,
  type DeleteAccountFormData,
} from "@/features/auth/schema";
import { useAuthStore } from "@/features/auth/zustand";
import { useNotificationsStore } from "@/features/notifications/store";
import { rewardsStore } from "@/features/rewards/zustand";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { getErrorMessage } from "@/shared/lib/utils";
import { useNotificationBadgeStore } from "@/shared/store";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, ScrollView } from "react-native";
import { styled } from "styled-components/native";

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

const HeaderCaption = styled(ThemedText)<{ $color?: string }>`
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

const FormContainer = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const Form = styled.View`
  max-width: 400px;
  width: 100%;
`;

const WarningText = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 22px;
`;

const DestructiveButton = styled.TouchableOpacity<{ $disabled?: boolean }>`
  padding-vertical: 14px;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.error};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 12px;
`;

const DestructiveButtonText = styled(ThemedText)`
  color: #fff;
  font-size: 16px;
  font-weight: 600;
`;

export function DeleteAccountScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const primaryColor = useThemeColor({}, "primary");
  const textMuted = useThemeColor({}, "textSecondary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const { showConfirm, showMessage, modalState, hide, getState } =
    useLocalBottomModal();

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onError: (error) => {
      showMessage({ title: "Error", message: getErrorMessage(error) });
    },
  });

  const { handleSubmit } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {},
  });

  const performDelete = useCallback(async () => {
    try {
      await deleteAccountMutation.mutateAsync();
      rewardsStore.getState().reset();
      useNotificationsStore.getState().clearAllNotifications();
      useNotificationBadgeStore.getState().clearNotifications();
      clearAuth();
      setTimeout(() => router.replace("/(auth)/login"), 0);
    } catch {
      // onError already showed modal
    }
  }, [deleteAccountMutation]);

  const handleDeletePress = useCallback(() => {
    void handleSubmit(() => {
      showConfirm({
        title: "Delete account",
        message:
          "Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.",
        cancelText: "Cancel",
        confirmText: "Delete account",
        destructive: true,
        onConfirm: () => {
          void performDelete();
        },
      });
    })();
  }, [handleSubmit, performDelete]);

  const isLoading = deleteAccountMutation.isPending;

  return (
    <>
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Delete account</PageTitle>
          <HeaderCaption type="caption" $color={textMuted}>
            Permanently delete your account and all associated data.
          </HeaderCaption>
        </HeaderLeft>
      </HeaderRow>
      <ScrollContent
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormContainer>
          <Form>
            <WarningText type="body">
              Deleting your account will remove all your personal data, loyalty
              points, and reward history. This action cannot be undone.
            </WarningText>
            <DestructiveButton
              onPress={handleDeletePress}
              disabled={isLoading}
              $disabled={isLoading}
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <DestructiveButtonText>Delete account</DestructiveButtonText>
              )}
            </DestructiveButton>
          </Form>
        </FormContainer>
      </ScrollContent>
    </Container>
    <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </>
  );
}
