import type { CustomerPoints } from "@/features/history/types";
import { apiClient } from "@/shared/lib/api-client";

const getCustomerPoints = async (): Promise<CustomerPoints[]> => {
  const response = await apiClient.get("/customer/points/history");
  const { data } = response?.data;
  return data as CustomerPoints[];
};

export { getCustomerPoints };
