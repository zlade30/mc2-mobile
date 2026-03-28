import { changePassword } from "@/features/auth/api";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "@/features/auth/schema";
import { getErrorMessage } from "@/shared/lib/utils";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { PrimaryButton } from "@/shared/ui/button";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { FormField, PasswordInput } from "@/shared/ui/input";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useMutation } from "@tanstack/react-query";
import { styled } from "styled-components/native";

const KeyboardAvoidingWrap = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const scrollContentStyle = { flexGrow: 1 };

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

export function ChangePasswordScreen() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, "primary");
  const textMuted = useThemeColor({}, "textSecondary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const { showMessage, modalState, hide, getState } = useLocalBottomModal();

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onError: (error) => {
      showMessage({ title: "Error", message: getErrorMessage(error) });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      showMessage({
        title: "Success",
        message: "Your password has been updated.",
      });
      router.back();
    } catch {
      // onError already showed modal
    }
  };

  const isLoading = changePasswordMutation.isPending;

  return (
    <>
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Change password</PageTitle>
          <HeaderCaption type="caption" $color={textMuted}>
            Update your password to keep your account secure.
          </HeaderCaption>
        </HeaderLeft>
      </HeaderRow>
      <KeyboardAvoidingWrap
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollContent
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={scrollContentStyle}
        >
          <FormContainer>
            <Form>
              <Controller
                control={control}
                name="current_password"
                disabled={isLoading}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Current password"
                    first
                    error={errors.current_password?.message}
                  >
                    <PasswordInput
                      hasError={Boolean(errors.current_password)}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="••••••••"
                      autoComplete="password"
                    />
                  </FormField>
                )}
              />
              <Controller
                control={control}
                name="password"
                disabled={isLoading}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="New password"
                    error={errors.password?.message}
                  >
                    <PasswordInput
                      hasError={Boolean(errors.password)}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </FormField>
                )}
              />
              <Controller
                control={control}
                name="password_confirmation"
                disabled={isLoading}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Confirm new password"
                    error={errors.password_confirmation?.message}
                  >
                    <PasswordInput
                      hasError={Boolean(errors.password_confirmation)}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                  </FormField>
                )}
              />
              <PrimaryButton
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                loading={isLoading}
              >
                Update password
              </PrimaryButton>
            </Form>
          </FormContainer>
        </ScrollContent>
      </KeyboardAvoidingWrap>
    </Container>
    <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </>
  );
}
