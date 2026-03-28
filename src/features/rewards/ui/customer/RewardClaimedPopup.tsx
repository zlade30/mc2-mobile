import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useCallback } from "react";
import { Modal, Pressable } from "react-native";
import { ThemeProvider, styled } from "styled-components/native";

import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { useRewardClaimPopupStore, useThemeForStyled } from "@/shared/store";
import { PrimaryButton } from "@/shared/ui/button";
import { ThemedText } from "@/shared/ui/themed-text";

const Backdrop = styled(Pressable)`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.45);
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Card = styled.View`
  width: 100%;
  max-width: 340px;
  border-radius: ${({ theme }) => theme.radii.xl};
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xxl};
  align-items: center;
`;

const IconCircle = styled.View<{ $bg: string }>`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  background-color: ${({ $bg }) => $bg};
`;

const Title = styled(ThemedText)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Message = styled(ThemedText)<{ $color: string }>`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ $color }) => $color};
`;

const ButtonWrap = styled.View`
  width: 100%;
`;

function RewardClaimedPopupInner() {
  const theme = useThemeForStyled();
  const successColor = useThemeColor({}, "successGreen");
  const textMuted = useThemeColor({}, "textSecondary");
  const visible = useRewardClaimPopupStore((state) => state.visible);
  const payload = useRewardClaimPopupStore((state) => state.payload);
  const hideRewardClaimPopup = useRewardClaimPopupStore(
    (state) => state.hideRewardClaimPopup,
  );

  const handleClose = useCallback(() => {
    hideRewardClaimPopup();
  }, [hideRewardClaimPopup]);

  const content = payload ?? {
    title: "Congratulations!",
    message: "You have claimed your reward successfully.",
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <ThemeProvider theme={theme}>
        <Backdrop onPress={handleClose}>
          <Pressable>
            <Card>
              <IconCircle $bg={`${successColor}22`}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={34}
                  color={successColor}
                />
              </IconCircle>
              <Title type="subtitle">{content.title}</Title>
              <Message type="caption" $color={textMuted}>
                {content.message}
              </Message>
              <ButtonWrap>
                <PrimaryButton size="small" onPress={handleClose}>
                  Close
                </PrimaryButton>
              </ButtonWrap>
            </Card>
          </Pressable>
        </Backdrop>
      </ThemeProvider>
    </Modal>
  );
}

export function RewardClaimedPopup() {
  return <RewardClaimedPopupInner />;
}
