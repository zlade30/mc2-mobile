import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

import type { User } from "@/features/auth/types";
import { apiClient } from "@/shared/lib/api-client";
import { authStore } from "./zustand";

const login = async (payload: {
  login: string;
  password: string;
}): Promise<{ token: string; user: User }> => {
  const response = await apiClient.post("/auth/login", payload);
  const { token } = response.data;
  const user = response?.data?.user as User;
  authStore.getState().setAuth(token, user);
  return response.data as { token: string; user: User };
};

const register = async (payload: {
  email: string;
  name: string;
  phone: string;
  password: string;
  password_confirmation: string;
  date_of_birth?: string;
}): Promise<{ token: string; user: User }> => {
  const response = await apiClient.post("/auth/register", payload);
  const { token } = response.data;
  const user = response?.data?.user as User;
  authStore.getState().setAuth(token, user);
  return response.data as { token: string; user: User };
};

const registerDevice = async (payload: {
  fcm_token: string;
  platform: string;
}): Promise<void> => {
  const response = await apiClient.post("/devices/register", payload);
  return response.data;
};

const unregisterDevice = async (payload: {
  fcm_token: string;
}): Promise<void> => {
  await apiClient.post("/devices/unregister", payload);
};

const changePassword = async (payload: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> => {
  await apiClient.post("/auth/change-password", payload);
};

const deleteAccount = async (): Promise<void> => {
  await apiClient.post("/customer/deactivate");
};

const forgotPassword = async (payload: { email: string }): Promise<void> => {
  await apiClient.post("/auth/forgot-password", payload);
};

const resetPassword = async (payload: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<void> => {
  await apiClient.post("/auth/reset-password", payload);
};

const socialLoginGoogle = async (): Promise<{ token: string; user: User }> => {
  // Must match the scheme + path Laravel redirects to in its Google callback.
  const redirectUri = "mc2app://auth-callback";
  const baseURL = apiClient.defaults.baseURL;
  const authUrl = `${baseURL}/auth/social/google`;

  console.log("[GoogleSignIn] opening auth url:", authUrl);
  console.log("[GoogleSignIn] expected redirect:", redirectUri);

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  console.log(
    "[GoogleSignIn] WebBrowser result:",
    JSON.stringify(result, null, 2),
  );

  if (result.type === "cancel" || result.type === "dismiss") {
    throw new Error("Sign in was cancelled.");
  }
  if (result.type !== "success" || !result.url) {
    throw new Error("Google sign in failed. Please try again.");
  }

  console.log("[GoogleSignIn] callback url:", result.url);

  const parsed = Linking.parse(result.url);
  console.log("[GoogleSignIn] parsed url:", JSON.stringify(parsed, null, 2));

  const { queryParams } = parsed;
  const errorParam =
    typeof queryParams?.error === "string" ? queryParams.error : null;
  if (errorParam) {
    console.log("[GoogleSignIn] server returned error:", errorParam);
    throw new Error(errorParam);
  }

  const token =
    typeof queryParams?.token === "string" ? queryParams.token : null;
  const userParam =
    typeof queryParams?.user === "string" ? queryParams.user : null;

  console.log("[GoogleSignIn] token present:", Boolean(token));
  console.log("[GoogleSignIn] user param present:", Boolean(userParam));
  console.log("[GoogleSignIn] raw user param:", userParam);

  if (!token || !userParam) {
    throw new Error("Invalid response from server.");
  }

  let user: User;
  try {
    user = JSON.parse(userParam) as User;
    console.log("[GoogleSignIn] parsed user:", JSON.stringify(user, null, 2));
  } catch (parseErr) {
    console.log("[GoogleSignIn] user JSON parse failed:", parseErr);
    throw new Error("Could not read account info from server.");
  }

  authStore.getState().setAuth(token, user);
  console.log("[GoogleSignIn] auth set successfully");
  return { token, user };
};

export {
  changePassword,
  deleteAccount,
  forgotPassword,
  login,
  register,
  registerDevice,
  resetPassword,
  socialLoginGoogle,
  unregisterDevice,
};
