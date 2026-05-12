import { authStore } from "@/features/auth/zustand";
import { apiClient } from "@/shared/lib/api-client";

const getCustomerProfile = async () => {
  const response = await apiClient.get("/customer/profile");
  const { data } = response?.data;
  authStore.getState().setUser(data);
  return response.data;
};

const getCustomerById = async (id: string) => {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
};

const updateCustomerProfile = async (payload: { date_of_birth: string }) => {
  const response = await apiClient.put("/customer/profile", payload);
  const data = response?.data?.data;
  if (data) {
    authStore.getState().setUser(data);
  }
  return response.data;
};

export { getCustomerById, getCustomerProfile, updateCustomerProfile };
