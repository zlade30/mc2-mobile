import type { Promo } from "@/features/promos/types";
import { apiClient } from "@/shared/lib/api-client";

const getPromos = async (): Promise<Promo[]> => {
  const response = await apiClient.get("/promotions");
  const { data } = response?.data;
  return data as Promo[];
};

const getPromoById = async (id: string): Promise<Promo> => {
  const response = await apiClient.get(`/promotions/${id}`);
  const { data } = response?.data ?? {};
  return (data ?? response?.data) as Promo;
};

export { getPromoById, getPromos };
