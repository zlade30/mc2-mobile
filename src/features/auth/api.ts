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

export {
  changePassword,
  deleteAccount,
  forgotPassword,
  login,
  register,
  registerDevice,
  resetPassword,
  unregisterDevice,
};
