import { ResetPasswordScreen } from "@/features/auth/ui/ResetPasswordScreen";
import { Redirect, useLocalSearchParams } from "expo-router";
import React from "react";

export default function ResetPasswordRoute() {
  const { token, email } = useLocalSearchParams<{
    token: string;
    email: string;
  }>();

  if (!token || !email) {
    return <Redirect href="/(auth)/forgot-password" />;
  }

  return (
    <ResetPasswordScreen
      token={decodeURIComponent(token)}
      email={decodeURIComponent(email)}
    />
  );
}
