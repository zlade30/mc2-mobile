import { apiClient } from "@/shared/lib/api-client";

type SubmitHelpCenterPayload = {
  subject: string;
  message: string;
};

const submitHelpCenterMessage = async (
  payload: SubmitHelpCenterPayload,
): Promise<void> => {
  await apiClient.post("/customer/help-center", payload);
};

export { submitHelpCenterMessage };
