import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { styled } from "styled-components/native";

import {
  getDemoRole,
  getMockDemoUser,
  isDemoCredentials,
  login,
  loginSchema,
  type LoginFormData,
  type Role,
} from "@/features/auth";
import { useAuthStore } from "@/features/auth/zustand";
import { rewardsStore } from "@/features/rewards/zustand";
import { useColorScheme } from "@/shared/hooks/use-color-scheme";
import { getErrorMessage } from "@/shared/lib/utils";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { LinkButton, PrimaryButton } from "@/shared/ui/button";
import { FormField, Input, PasswordInput } from "@/shared/ui/input";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import { useMutation } from "@tanstack/react-query";

const { height: windowHeight } = Dimensions.get("window");
const KEYBOARD_AVOID_PADDING = 0;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

const FormContainer = styled.View`
  flex-grow: 1;
  padding-top: 48px;
  padding-bottom: ${KEYBOARD_AVOID_PADDING}px;
  min-height: ${windowHeight - 24 * 2}px;
  justify-content: flex-start;
  padding-left: ${(p) => p.theme.spacing.xxl};
  padding-right: ${(p) => p.theme.spacing.xxl};
  padding-bottom: ${(p) => p.theme.spacing.xxl};
`;

const Form = styled.View`
  max-width: 400px;
  width: 100%;
  align-self: center;
`;

const Logo = styled(Image)`
  align-self: center;
  width: 190px;
  height: 190px;
`;

const LoginTitle = styled(ThemedText)`
  margin-bottom: 4px;
  text-align: center;
  margin-top: 40px;
`;

const LoginSub = styled(ThemedText)`
  margin-bottom: 8px;
  text-align: center;
`;

const DEMO_TOKEN = "demo-token";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { showMessage, modalState, hide, getState } = useLocalBottomModal();

  const loginMutation = useMutation({
    mutationFn: login,
    onError: (error) => {
      showMessage({ title: "Error", message: getErrorMessage(error) });
    },
  });

  const isLoading = loginMutation.isPending;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isDemoCredentials(data.email, data.password)) {
      const role = getDemoRole(data.email);
      const mockUser = getMockDemoUser(role);
      setAuth(DEMO_TOKEN, mockUser);
      if (role === "customer") {
        router.replace("/(demo)/customer/(tabs)");
      } else {
        router.replace("/(demo)/staff/(tabs)");
      }
      return;
    }

    try {
      rewardsStore.getState().reset();
      const response = await loginMutation.mutateAsync({
        login: data.email.trim(),
        password: data.password,
      });

      const roles = response.user.roles || [];
      const isCustomer = roles.some((role: Role) => role.name === "customer");

      if (isCustomer) {
        router.replace("/(customer)/(tabs)");
      } else {
        router.replace("/(staff)/(tabs)");
      }
    } catch {
      // onError already showed modal
    }
  };

  return (
    <>
    <ThemedSafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollContent
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <FormContainer>
            <Form>
              {colorScheme === "light" ? (
                <Logo source={require("@/assets/images/logo.png")} />
              ) : (
                <Logo source={require("@/assets/images/logo-dark.png")} />
              )}
              <LoginTitle type="title">Welcome back</LoginTitle>
              <LoginSub type="caption">Your next cup is waiting ☕</LoginSub>

              <Controller
                control={control}
                name="email"
                disabled={isLoading}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Email" first error={errors.email?.message}>
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

              <Controller
                control={control}
                disabled={isLoading}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Password" error={errors.password?.message}>
                    <PasswordInput
                      hasError={Boolean(errors.password)}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="••••••••"
                      autoComplete="password"
                    />
                  </FormField>
                )}
              />

              <PrimaryButton
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                loading={isLoading}
              >
                Sign in
              </PrimaryButton>
              <View style={{ height: 20 }} />
              <LinkButton
                onPress={() => router.push("/(auth)/forgot-password")}
              >
                <ThemedText type="link">Forgot password?</ThemedText>
              </LinkButton>
              <LinkButton onPress={() => router.push("/(auth)/register")}>
                <ThemedText type="link">Create an account</ThemedText>
              </LinkButton>
              {/* <DemoHint type="caption">
                Demo: demo@demo.com / demo (customer), staff@demo.com / demo
                (staff)
              </DemoHint> */}
            </Form>
          </FormContainer>
        </ScrollContent>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
    <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </>
  );
}
