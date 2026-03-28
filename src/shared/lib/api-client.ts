import { authStore } from "@/features/auth/zustand";
import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const baseURL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://deploytest.live/api/v1";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    return Promise.reject(error);
  },
);
