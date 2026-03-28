import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { styled } from "styled-components/native";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { submitHelpCenterMessage } from "@/features/help-center/api";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
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

const Subtitle = styled(ThemedText)<{ $color?: string }>`
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const KeyboardAvoiding = styled(KeyboardAvoidingView)`
  flex: 1;
`;

const ScrollContent = styled(ScrollView)`
  flex: 1;
`;

const FormContainer = styled.View`
  flex-grow: 1;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-top: ${({ theme }) => theme.spacing.sm};
  padding-bottom: ${({ theme }) => theme.spacing.xxl};
`;

const Form = styled.View`
  max-width: 460px;
  width: 100%;
  align-self: center;
`;

const MessageInput = styled(Input)`
  min-height: 140px;
`;

const CharacterCounter = styled(ThemedText)<{ $color?: string }>`
  margin-top: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const helpCenterFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(2, "Please enter a subject.")
    .max(200, "Subject is too long."),
  message: z
    .string()
    .trim()
    .min(10, "Please enter a message (at least 10 characters).")
    .max(2000, "Message is too long."),
});

type HelpCenterFormData = z.infer<typeof helpCenterFormSchema>;

export default function HelpCenterScreen() {
  const textMuted = useThemeColor({}, "textSecondary");
  const primaryColor = useThemeColor({}, "primary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );

  return (
    <Container>
      <HeaderRow>
        <HeaderBackButton
          backgroundColor={primaryColor}
          iconColor={cardOnDarkText}
        />
        <HeaderLeft>
          <PageTitle type="title">Help Center</PageTitle>
          <Subtitle type="caption" $color={textMuted}>
            Send us a message and we&apos;ll get back to you as soon as
            possible.
          </Subtitle>
        </HeaderLeft>
      </HeaderRow>
      <KeyboardAvoiding behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollContent keyboardShouldPersistTaps="handled">
          <HelpCenterForm />
        </ScrollContent>
      </KeyboardAvoiding>
    </Container>
  );
}

function HelpCenterForm() {
  const textMuted = useThemeColor({}, "textSecondary");
  const router = useRouter();
  const { showMessage, modalState, hide, getState } = useLocalBottomModal();
  const helpCenterMutation = useMutation({
    mutationFn: submitHelpCenterMessage,
    onError: (error) => {
      showMessage({ title: "Error", message: getErrorMessage(error) });
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<HelpCenterFormData>({
    resolver: zodResolver(helpCenterFormSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  });

  const messageValue = watch("message");
  const remainingCharacters = 2000 - (messageValue?.length ?? 0);
  const isLoading = helpCenterMutation.isPending;

  const onSubmit = async (data: HelpCenterFormData) => {
    try {
      await helpCenterMutation.mutateAsync({
        subject: data.subject,
        message: data.message,
      });
      reset();
      showMessage({
        title: "Message sent",
        message: "We'll get back to you soon.",
      });
      router.back();
    } catch {
      // onError already showed modal
    }
  };

  return (
    <FormContainer>
      <Form>
        <Controller
          control={control}
          name="subject"
          disabled={isLoading}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField label="Subject" first error={errors.subject?.message}>
              <Input
                hasError={Boolean(errors.subject)}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="What is this about?"
                autoCapitalize="sentences"
                autoComplete="off"
              />
            </FormField>
          )}
        />

        <Controller
          control={control}
          name="message"
          disabled={isLoading}
          render={({ field: { onChange, onBlur, value } }) => (
            <FormField label="Message" error={errors.message?.message}>
              <>
                <MessageInput
                  hasError={Boolean(errors.message)}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="How can we help?"
                  autoCapitalize="sentences"
                  autoComplete="off"
                  numberOfLines={6}
                  multiline
                  textAlignVertical="top"
                  maxLength={2000}
                />
                <CharacterCounter type="caption" $color={textMuted}>
                  {remainingCharacters} characters left
                </CharacterCounter>
              </>
            </FormField>
          )}
        />

        <PrimaryButton
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          loading={isLoading}
        >
          Send
        </PrimaryButton>
      </Form>
      <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </FormContainer>
  );
}
