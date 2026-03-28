import { resetPassword } from "@/features/auth/api";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/features/auth/schema";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { getErrorMessage } from "@/shared/lib/utils";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { LinkButton, PrimaryButton } from "@/shared/ui/button";
import { FormField, PasswordInput } from "@/shared/ui/input";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { styled } from "styled-components/native";

const KeyboardAvoidingWrap = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const scrollContentStyle = { flexGrow: 1 };

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
`;

const HeaderRow = styled.View`
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-vertical: ${({ theme }) => theme.spacing.lg};
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

const LoginLinkWrap = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

type ResetPasswordScreenProps = {
  token: string;
  email: string;
};

export function ResetPasswordScreen({
  token,
  email,
}: ResetPasswordScreenProps) {
  const router = useRouter();
  const textMuted = useThemeColor({}, "textSecondary");
  const { showMessage, modalState, hide, getState } = useLocalBottomModal();

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onError: (error) => {
      showMessage({ title: "Error", message: getErrorMessage(error) });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({
        token,
        email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });
      showMessage({
        title: "Password reset",
        message:
          "Your password has been updated. You can sign in with your new password.",
      });
      router.replace("/(auth)/login");
    } catch {
      // onError already showed modal
    }
  };

  const isLoading = resetPasswordMutation.isPending;

  return (
    <>
    <Container>
      <HeaderRow>
        <PageTitle type="title">Reset password</PageTitle>
        <HeaderCaption type="caption" $color={textMuted}>
          Enter your new password below.
        </HeaderCaption>
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
                name="password"
                disabled={isLoading}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="New password"
                    first
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
                Reset password
              </PrimaryButton>
              <LoginLinkWrap>
                <LinkButton onPress={() => router.replace("/(auth)/login")}>
                  Back to login
                </LinkButton>
              </LoginLinkWrap>
            </Form>
          </FormContainer>
        </ScrollContent>
      </KeyboardAvoidingWrap>
    </Container>
    <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </>
  );
}
