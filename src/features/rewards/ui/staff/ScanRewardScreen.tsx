import { getCustomerRewardsByQrCode } from "@/features/rewards";
import { useRewardsStore } from "@/features/rewards/zustand";
import { useThemeColor } from "@/shared/hooks/use-theme-color";
import { getErrorMessage } from "@/shared/lib/utils";
import { Spacing } from "@/shared/theme";
import {
  LocalBottomModal,
  useLocalBottomModal,
} from "@/shared/ui/bottom-modal";
import { LinkButton, PrimaryButton } from "@/shared/ui/button";
import { HeaderBackButton } from "@/shared/ui/header-back-button";
import { ThemedText } from "@/shared/ui/themed-text";
import { ThemedSafeAreaView } from "@/shared/ui/themed-view";
import BarcodeScanning from "@react-native-ml-kit/barcode-scanning";
import { Camera, Gallery } from "@solar-icons/react-native/Broken";
import { useQueryClient } from "@tanstack/react-query";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styled } from "styled-components/native";

const AbsoluteFill = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const Container = styled(ThemedSafeAreaView)`
  flex: 1;
  background-color: #000;
`;

const PermissionContainer = styled(ThemedSafeAreaView)`
  flex: 1;
  justify-content: center;
  align-items: center;
`;

const PermissionContent = styled.View`
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  max-width: 320px;
`;

const Message = styled(ThemedText)`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxl};
  padding-horizontal: ${({ theme }) => theme.spacing.sm};
`;

const PrimaryActionWrap = styled.View`
  width: 100%;
`;

const BackLinkWrap = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const BackLinkText = styled(ThemedText)<{ $color: string }>`
  color: ${({ $color }) => $color};
`;

const ScanOverlay = styled(AbsoluteFill)`
  justify-content: center;
  align-items: center;
`;

const OverlayFrame = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const OverlayBar = styled.View`
  background-color: rgba(0, 0, 0, 0.5);
`;

const OverlayTop = styled(OverlayBar)`
  width: 100%;
  flex: 1;
  min-height: 0;
`;

const OverlayBottom = styled(OverlayBar)`
  width: 100%;
  flex: 1;
  min-height: 0;
`;

const OverlayMiddleRow = styled.View`
  flex-direction: row;
  width: 100%;
  height: 240px;
`;

const OverlayLeft = styled(OverlayBar)`
  flex: 1;
  min-width: 0;
`;

const OverlayRight = styled(OverlayBar)`
  flex: 1;
  min-width: 0;
`;

const OverlayCenterCutout = styled.View`
  width: 240px;
  height: 240px;
`;

const ScanSquare = styled.View`
  width: 240px;
  height: 240px;
  border-width: 2px;
  border-color: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  position: relative;
`;

const Corner = styled.View<{
  $top?: number;
  $left?: number;
  $right?: number;
  $bottom?: number;
  $borderRightWidth?: number;
  $borderLeftWidth?: number;
  $borderTopWidth?: number;
  $borderBottomWidth?: number;
  $borderTopLeftRadius?: number;
  $borderTopRightRadius?: number;
  $borderBottomLeftRadius?: number;
  $borderBottomRightRadius?: number;
}>`
  position: absolute;
  width: 24px;
  height: 24px;
  border-color: #fff;
  border-width: 3px;
  ${({ $top }) => ($top != null ? `top: ${$top}px;` : "")}
  ${({ $left }) => ($left != null ? `left: ${$left}px;` : "")}
  ${({ $right }) => ($right != null ? `right: ${$right}px;` : "")}
  ${({ $bottom }) => ($bottom != null ? `bottom: ${$bottom}px;` : "")}
  ${({ $borderRightWidth }) =>
    $borderRightWidth != null
      ? `border-right-width: ${$borderRightWidth}px;`
      : ""}
  ${({ $borderLeftWidth }) =>
    $borderLeftWidth != null ? `border-left-width: ${$borderLeftWidth}px;` : ""}
  ${({ $borderTopWidth }) =>
    $borderTopWidth != null ? `border-top-width: ${$borderTopWidth}px;` : ""}
  ${({ $borderBottomWidth }) =>
    $borderBottomWidth != null
      ? `border-bottom-width: ${$borderBottomWidth}px;`
      : ""}
  ${({ $borderTopLeftRadius }) =>
    $borderTopLeftRadius != null
      ? `border-top-left-radius: ${$borderTopLeftRadius}px;`
      : ""}
  ${({ $borderTopRightRadius }) =>
    $borderTopRightRadius != null
      ? `border-top-right-radius: ${$borderTopRightRadius}px;`
      : ""}
  ${({ $borderBottomLeftRadius }) =>
    $borderBottomLeftRadius != null
      ? `border-bottom-left-radius: ${$borderBottomLeftRadius}px;`
      : ""}
  ${({ $borderBottomRightRadius }) =>
    $borderBottomRightRadius != null
      ? `border-bottom-right-radius: ${$borderBottomRightRadius}px;`
      : ""}
`;

const HeaderRow = styled.View<{ $paddingTop?: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  flex-direction: row;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-vertical: ${({ theme }) => theme.spacing.lg};
  ${({ $paddingTop }) =>
    $paddingTop != null ? `padding-top: ${$paddingTop}px;` : ""}
`;

const HeaderLeft = styled.View`
  flex: 1;
`;

const PageTitle = styled(ThemedText)<{ $color?: string }>`
  margin-top: 0;
  margin-bottom: 2px;
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const HeaderCaption = styled(ThemedText)<{ $color?: string }>`
  ${({ $color }) => ($color != null ? `color: ${$color};` : "")}
`;

const FooterWrap = styled.View`
  position: absolute;
  bottom: 48px;
  left: ${({ theme }) => theme.spacing.xl};
  right: ${({ theme }) => theme.spacing.xl};
  align-items: center;
`;

const FooterText = styled(ThemedText)`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-align: center;
`;

const UploadQrButton = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-vertical: ${({ theme }) => theme.spacing.sm};
  padding-horizontal: ${({ theme }) => theme.spacing.lg};
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.5);
  border-radius: ${({ theme }) => theme.radii.full};
`;

const UploadQrButtonText = styled(ThemedText)`
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  font-weight: 600;
`;

const StyledCameraView = styled(CameraView)`
  flex: 1;
`;

const UploadOnlyContainer = styled(ThemedSafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors?.background ?? "#fff"};
`;

const UploadOnlyContent = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
`;

const UploadOnlyHeader = styled.View`
  flex-direction: row;
  align-items: center;
  padding-horizontal: ${({ theme }) => theme.spacing.xxl};
  padding-vertical: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const UploadOnlyMessage = styled(Message)`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export default function ScanRewardScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isUploadOnly = mode === "upload";
  const [permission, requestPermission] = useCameraPermissions();
  const { showMessage, modalState, hide, getState } = useLocalBottomModal();
  const [scanned, setScanned] = useState(false);
  const [uploadingScanning, setUploadingScanning] = useState(false);
  const lastScanTimeRef = useRef(0);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const primaryColor = useThemeColor({}, "primary");
  const cardOnDarkText = useThemeColor(
    { light: "#F5F0E8", dark: "#F5F0E8" },
    "background",
  );
  const textMuted = useThemeColor({}, "textSecondary");
  const queryClient = useQueryClient();
  const { setIsScanned } = useRewardsStore();

  const processQrCode = useCallback(
    async (data: string) => {
      setScanned(true);
      try {
        const result = await queryClient.fetchQuery({
          queryKey: ["customerRewardsByQrCode", data],
          queryFn: () => getCustomerRewardsByQrCode(data),
        });
        if (result.length > 0) {
          setIsScanned(true);
          router.replace("/(staff)/(tabs)");
        } else {
          showMessage({
            title: "Not found",
            message: "No rewards found for this customer.",
          });
          setScanned(false);
          setIsScanned(false);
        }
      } catch (error: unknown) {
        showMessage({
          title: "Error",
          message: getErrorMessage(
            error,
            "No customer was found for this QR code. Please try again.",
          ),
        });
        setScanned(false);
        setIsScanned(false);
      }
    },
    [router, queryClient, setIsScanned, showMessage],
  );

  const handleBarcodeScanned = useCallback(
    async ({ data }: { type: string; data: string }) => {
      const now = Date.now();
      if (now - lastScanTimeRef.current < 5000) return;
      if (scanned) return;
      lastScanTimeRef.current = now;
      await processQrCode(data);
    },
    [scanned, processQrCode],
  );

  const handleUploadQr = useCallback(() => {
    if (scanned || uploadingScanning) return;
    // Defer opening the picker so iOS doesn't freeze when the photo library is presented
    setImmediate(async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: false,
        });
        if (result.canceled || !result.assets?.[0]?.uri) return;
        const uri = result.assets[0].uri;
        setUploadingScanning(true);
        try {
          const barcodes = await BarcodeScanning.scan(uri);
          if (barcodes?.length > 0 && barcodes[0].value) {
            await processQrCode(barcodes[0].value);
          } else {
            showMessage({
              title: "No QR code found",
              message:
                "No QR code was found in the image. Please try another image.",
            });
          }
        } catch (error: unknown) {
          showMessage({
            title: "Scan failed",
            message: getErrorMessage(
              error,
              "Could not read the image. Please try another image or use the camera.",
            ),
          });
        } finally {
          setUploadingScanning(false);
        }
      } catch (error: unknown) {
        showMessage({
          title: "Scan failed",
          message: getErrorMessage(
            error,
            "Could not read the image. Please try another image or use the camera.",
          ),
        });
      }
    });
  }, [scanned, uploadingScanning, processQrCode, showMessage]);

  if (isUploadOnly) {
    return (
      <>
        <UploadOnlyContainer>
          <UploadOnlyHeader>
            <HeaderBackButton
              backgroundColor={primaryColor}
              iconColor={cardOnDarkText}
            />
            <HeaderLeft>
              <PageTitle type="title">Scan from gallery</PageTitle>
              <HeaderCaption type="caption" $color={textMuted}>
                Choose an image with the customer&apos;s QR code.
              </HeaderCaption>
            </HeaderLeft>
          </UploadOnlyHeader>
          <UploadOnlyContent>
            <Gallery
              size={40}
              color={primaryColor}
              style={{ marginBottom: Spacing.xl }}
            />
            <UploadOnlyMessage type="subtitle">
              Choose an image containing the customer&apos;s QR code to verify
              rewards.
            </UploadOnlyMessage>
            <PrimaryActionWrap>
              <PrimaryButton
                onPress={handleUploadQr}
                loading={uploadingScanning}
                leftIcon={<Gallery size={20} color="#fff" />}
              >
                Select from gallery
              </PrimaryButton>
            </PrimaryActionWrap>
          </UploadOnlyContent>
        </UploadOnlyContainer>
        <LocalBottomModal
          state={modalState}
          onHide={hide}
          getState={getState}
        />
      </>
    );
  }

  if (!permission) {
    return (
      <PermissionContainer>
        <PermissionContent>
          <ActivityIndicator size="large" color={primaryColor} />
        </PermissionContent>
      </PermissionContainer>
    );
  }

  if (!permission.granted) {
    return (
      <PermissionContainer>
        <PermissionContent>
          <Camera
            size={40}
            color={primaryColor}
            style={{ marginBottom: Spacing.xl }}
          />
          <Message type="subtitle">
            Camera access is needed to scan redemption QR codes.
          </Message>
          <PrimaryActionWrap>
            <PrimaryButton onPress={requestPermission}>
              Allow camera
            </PrimaryButton>
          </PrimaryActionWrap>
          <BackLinkWrap>
            <LinkButton onPress={() => router.back()}>
              <BackLinkText type="caption" $color={primaryColor}>
                Go back
              </BackLinkText>
            </LinkButton>
          </BackLinkWrap>
        </PermissionContent>
      </PermissionContainer>
    );
  }

  return (
    <>
      <Container lightColor="#000" darkColor="#000">
        <AbsoluteFill>
          <StyledCameraView
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
        </AbsoluteFill>
        <ScanOverlay pointerEvents="box-none">
          <OverlayFrame pointerEvents="none">
            <OverlayTop />
            <OverlayMiddleRow>
              <OverlayLeft />
              <OverlayCenterCutout />
              <OverlayRight />
            </OverlayMiddleRow>
            <OverlayBottom />
          </OverlayFrame>
          <ScanSquare>
            <Corner
              $top={-2}
              $left={-2}
              $borderRightWidth={0}
              $borderBottomWidth={0}
              $borderTopLeftRadius={16}
            />
            <Corner
              $top={-2}
              $right={-2}
              $borderLeftWidth={0}
              $borderBottomWidth={0}
              $borderTopRightRadius={16}
            />
            <Corner
              $bottom={-2}
              $left={-2}
              $borderRightWidth={0}
              $borderTopWidth={0}
              $borderBottomLeftRadius={16}
            />
            <Corner
              $bottom={-2}
              $right={-2}
              $borderLeftWidth={0}
              $borderTopWidth={0}
              $borderBottomRightRadius={16}
            />
          </ScanSquare>
        </ScanOverlay>
        <HeaderRow $paddingTop={insets.top + Spacing.md}>
          <HeaderBackButton
            backgroundColor={primaryColor}
            iconColor={cardOnDarkText}
          />
          <HeaderLeft>
            <PageTitle type="title" $color={cardOnDarkText}>
              Scan redemption QR
            </PageTitle>
            <HeaderCaption type="caption" $color={cardOnDarkText}>
              Point the camera at the customer&apos;s redemption QR code
            </HeaderCaption>
          </HeaderLeft>
        </HeaderRow>
        {!scanned && (
          <FooterWrap>
            <FooterText>
              Point the camera at the customer&apos;s redemption QR code
            </FooterText>
            <UploadQrButton
              onPress={handleUploadQr}
              disabled={uploadingScanning}
              accessibilityLabel="Upload QR code from gallery"
            >
              {uploadingScanning ? (
                <ActivityIndicator
                  size="small"
                  color="rgba(255, 255, 255, 0.95)"
                />
              ) : (
                <>
                  <Gallery size={18} color="rgba(255, 255, 255, 0.95)" />
                  <UploadQrButtonText type="caption">
                    Upload QR
                  </UploadQrButtonText>
                </>
              )}
            </UploadQrButton>
          </FooterWrap>
        )}
      </Container>
      <LocalBottomModal state={modalState} onHide={hide} getState={getState} />
    </>
  );
}
