import { forgotPassword } from "@/features/auth/api";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/features/auth/schema";
import { getErrorMessage } from "@/shared/lib/utils";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { PrimaryButton } from "@/shared/ui/button";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { FormField, Input } from "@/shared/ui/input";
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

export function ForgotPasswordScreen() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, "primary");
  const textMuted = useThemeColor({}, "textSecondary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const { showMessage, modalState, hide, getState } = useLocalBottomModal();

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onError: (error) => {
      showMessage({ title: "Error", message: getErrorMessage(error) });
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync({
        email: data.email.trim(),
      });
      showMessage({
        title: "Check your email",
        message:
          "If an account exists for that email, we've sent instructions to reset your password.",
      });
      router.back();
    } catch {
      // onError already showed modal
    }
  };

  const isLoading = forgotPasswordMutation.isPending;

  return (
    <>
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Forgot password</PageTitle>
          <HeaderCaption type="caption" $color={textMuted}>
            Enter your email and we'll send you a link to reset your password.
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
                name="email"
                disabled={isLoading}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Email"
                    first
                    error={errors.email?.message}
                  >
                    <Input
                      hasError={Boolean(errors.email)}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="you@example.com"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                  </FormField>
                )}
              />
              <PrimaryButton
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                loading={isLoading}
              >
                Send reset link
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
