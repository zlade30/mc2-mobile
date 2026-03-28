import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { styled } from "styled-components/native";

import {
  register,
  registerSchema,
  type RegisterFormData,
} from "@/features/auth";
import { getTerms } from "@/features/terms/api";
import { wrapHtmlFragment } from "@/features/terms/wrap-html";
import { useColorScheme } from "@/shared/hooks/use-color-scheme";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { getErrorMessage } from "@/shared/lib/utils";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { LinkButton, PrimaryButton } from "@/shared/ui/button";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { FormField, Input, PasswordInput } from "@/shared/ui/input";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedView } from "@/shared/ui/themed-view";
import { useMutation, useQuery } from "@tanstack/react-query";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

const KeyboardWrap = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-vertical: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const PageTitle = styled(ThemedText)`
  margin-top: 0;
  margin-bottom: 2px;
`;

const FormContainer = styled.View`
  flex-grow: 1;
  padding: ${(p) => p.theme.spacing.xxl};
  padding-top: 0;
  padding-bottom: ${(p) => p.theme.spacing.xl};
  min-height: ${windowHeight - 24 * 2}px;
  justify-content: flex-start;
`;

const Form = styled.View`
  max-width: 400px;
  width: 100%;
  align-self: center;
`;

const TermsRow = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CheckboxBox = styled.View<{ $checked: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border-width: 2px;
  border-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary : theme.colors.border};
  background-color: ${({ theme, $checked }) =>
    $checked ? theme.colors.primary : theme.colors.surface};
  align-items: center;
  justify-content: center;
`;

const TermsLabel = styled(ThemedText)`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.body}px;
`;

const TermsLink = styled(ThemedText)`
  color: ${({ theme }) => theme.colors.link};
`;

const MODAL_PANEL_HEIGHT = windowHeight * 0.8;
const MODAL_PANEL_WIDTH = windowWidth * 0.9;

const TermsModalBackdrop = styled(Pressable)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const TermsModalPanel = styled.View<{
  $paddingBottom: number;
  $height: number;
  $width: number;
}>`
  width: ${({ $width }) => $width}px;
  height: ${({ $height }) => $height}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ $paddingBottom }) => $paddingBottom}px;
`;

const TermsModalTitle = styled(ThemedText)`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-family: ${({ theme }) => theme.typography.fontFamily.extraBold};
  font-size: ${({ theme }) => theme.typography.subtitle}px;
`;

const TermsWebViewWrap = styled.View`
  flex: 1;
  min-height: 200px;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  overflow: hidden;
`;

const TermsWebView = styled(WebView)`
  flex: 1;
  background-color: transparent;
`;

const TermsLoadingWrap = styled.View`
  flex: 1;
  min-height: 200px;
  justify-content: center;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const TermsBody = styled(ThemedText)`
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: ${({ theme }) => theme.typography.bodyLineHeight}px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TermsAgreeButton = styled(Pressable)`
  background-color: ${({ theme }) => theme.colors.primary};
  padding-vertical: 14px;
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radii.md};
  align-items: center;
  justify-content: center;
`;

const TermsAgreeButtonText = styled(ThemedText)`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryForeground};
`;

const TERMS_QUERY_KEY = ["terms"] as const;

type TermsModalContentProps = {
  isTermsLoading: boolean;
  termsHtmlSource: { html: string } | null;
  screenIconColor: string;
  onAgree: () => void;
  paddingBottom: number;
};

const TermsModalContent = React.memo(function TermsModalContent({
  isTermsLoading,
  termsHtmlSource,
  screenIconColor,
  onAgree,
  paddingBottom,
}: TermsModalContentProps) {
  return (
    <TermsModalPanel
      $paddingBottom={paddingBottom}
      $height={MODAL_PANEL_HEIGHT}
      $width={MODAL_PANEL_WIDTH}
    >
      <TermsModalTitle type="subtitle">Terms of Service</TermsModalTitle>
      {isTermsLoading ? (
        <TermsLoadingWrap>
          <ActivityIndicator size="large" color={screenIconColor} />
        </TermsLoadingWrap>
      ) : termsHtmlSource ? (
        <TermsWebViewWrap>
          <TermsWebView
            key="terms-webview"
            source={termsHtmlSource}
            originWhitelist={["*"]}
            scrollEnabled
            showsVerticalScrollIndicator
            nestedScrollEnabled
          />
        </TermsWebViewWrap>
      ) : null}
      <TermsAgreeButton
        onPress={onAgree}
        accessibilityRole="button"
        accessibilityLabel="Agree"
      >
        <TermsAgreeButtonText>Agree</TermsAgreeButtonText>
      </TermsAgreeButton>
    </TermsModalPanel>
  );
});

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const { showMessage, modalState, hide, getState } = useLocalBottomModal();

  const colorScheme = useColorScheme() ?? "light";
  const { data: termsHtml, isLoading: isTermsLoading } = useQuery({
    queryKey: TERMS_QUERY_KEY,
    queryFn: getTerms,
  });

  const termsHtmlSource = useMemo(
    () =>
      typeof termsHtml === "string" && termsHtml.trim().length > 0
        ? { html: wrapHtmlFragment(termsHtml, colorScheme) }
        : null,
    [termsHtml, colorScheme],
  );

  const primaryColor = useThemeColor({}, "primary");
  const screenIconColor = useThemeColor({}, "screenIcon");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const textMuted = useThemeColor({}, "textSecondary");

  const openTermsModal = useCallback(() => setTermsModalVisible(true), []);
  const closeTermsModal = useCallback(() => setTermsModalVisible(false), []);
  const handleTermsAgree = useCallback(() => {
    setTermsAccepted(true);
    setTermsModalVisible(false);
  }, []);

  const registerMutation = useMutation({
    mutationFn: register,
    onError: (error) => {
      showMessage({ title: "Error", message: getErrorMessage(error) });
    },
  });

  const isLoading = registerMutation.isPending;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!termsAccepted) {
      showMessage({
        title: "Terms of Service",
        message: "You must agree to the Terms of Service to create an account.",
      });
      return;
    }
    try {
      await registerMutation.mutateAsync({
        ...data,
        password_confirmation: data.password,
      });
      showMessage({
        title: "Check your email",
        message:
          "A verification link has been sent. Please check your inbox and click the link/button to verify your account.",
        onClose: () => router.replace("/(auth)/login"),
      });
    } catch {
      // onError already showed modal
    }
  };

  return (
    <ThemedView style={{ flex: 1, paddingTop: 48 }}>
      <KeyboardWrap
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollContent
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <HeaderRow>
            <HeaderBackButton
              backgroundColor={primaryColor}
              iconColor={cardOnDarkText}
            />
            <HeaderLeft>
              <PageTitle type="title">Create account</PageTitle>
              <ThemedText type="caption" style={{ color: textMuted }}>
                Create your account to start earning rewards.
              </ThemedText>
            </HeaderLeft>
          </HeaderRow>
          <FormContainer>
            <Form>
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
                name="name"
                disabled={isLoading}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Name" error={errors.name?.message}>
                    <Input
                      hasError={Boolean(errors.name)}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="phone"
                disabled={isLoading}
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField label="Phone" error={errors.phone?.message}>
                    <Input
                      hasError={Boolean(errors.phone)}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="09XXXXXXXXX"
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="password"
                disabled={isLoading}
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

              <TermsRow
                onPress={openTermsModal}
                disabled={isLoading}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
                accessibilityLabel="I agree to the Terms of Service"
              >
                <CheckboxBox $checked={termsAccepted}>
                  {termsAccepted && (
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color="#ffffff"
                    />
                  )}
                </CheckboxBox>
                <TermsLabel type="default">
                  I agree to the{" "}
                  <TermsLink type="default">Terms of Service</TermsLink>
                </TermsLabel>
              </TermsRow>

              <PrimaryButton
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                loading={isLoading}
              >
                Create account
              </PrimaryButton>
              <LinkButton onPress={() => router.back()}>
                <ThemedText type="link">
                  Already have an account? Sign in
                </ThemedText>
              </LinkButton>
            </Form>
          </FormContainer>
        </ScrollContent>
      </KeyboardWrap>

      <Modal
        visible={termsModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeTermsModal}
      >
        <TermsModalBackdrop onPress={closeTermsModal}>
          <Pressable onPress={() => {}} pointerEvents="box-none">
            <TermsModalContent
              isTermsLoading={isTermsLoading}
              termsHtmlSource={termsHtmlSource}
              screenIconColor={screenIconColor}
              onAgree={handleTermsAgree}
              paddingBottom={Math.max(insets.bottom, 24)}
            />
          </Pressable>
        </TermsModalBackdrop>
      </Modal>
      <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </ThemedView>
  );
}
