import { useBiometricStore } from "@/shared/store";
import { CreatePinView } from "@/shared/ui/create-pin-view";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";

export default function SetPinScreen() {
  const router = useRouter();

  const handleSuccess = useCallback(() => {
    useBiometricStore.getState().setBiometricEnabled(true);
    useBiometricStore.getState().setUnlockedThisSession(true);
    router.back();
  }, [router]);

  return (
    <CreatePinView onSuccess={handleSuccess} onCancel={() => router.back()} />
  );
}
