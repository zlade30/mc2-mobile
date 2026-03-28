import { apiClient } from "@/shared/lib/api-client";

type TermsResponse = { data: string };

export const getTerms = async (): Promise<string> => {
  const response = await apiClient.get<TermsResponse>("/terms");
  const html = response.data?.data;
  return typeof html === "string" ? html : "";
};
