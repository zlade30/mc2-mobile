import type {
  ClaimedReward,
  CustomerRewards,
  StaffItem,
} from "@/features/rewards/types";
import { apiClient } from "@/shared/lib/api-client";
import { rewardsStore } from "./zustand";

const getCustomerRewards = async (): Promise<CustomerRewards> => {
  const response = await apiClient.get("/customer/rewards");
  const { data } = response?.data;
  return data as CustomerRewards;
};

const getCustomerRewardsByQrCode = async (
  customerHashedId: string,
): Promise<CustomerRewards["redeemable"]> => {
  const response = await apiClient.get(
    `/staff/customers/${customerHashedId}/rewards`,
  );
  const { data } = response?.data;
  rewardsStore.setState({
    reedemableRewards: data?.redeemable ?? [],
    customerHashId: customerHashedId,
  });
  return data?.redeemable ?? ([] as CustomerRewards["redeemable"]);
};

const claimCustomerReward = async (
  rewardHashId: string,
  payload: {
    reward_rule_id: number;
    claim_amount: number;
    variant_id: string;
  },
): Promise<ClaimedReward> => {
  const response = await apiClient.post(
    `/staff/rewards/${rewardHashId}/claim`,
    payload,
  );
  const { data } = response?.data;
  return data as ClaimedReward;
};

const getStaffItems = async (): Promise<StaffItem[]> => {
  const response = await apiClient.get("/staff/items");
  const { data } = response?.data;
  return (data ?? []) as StaffItem[];
};

export {
  claimCustomerReward,
  getCustomerRewards,
  getCustomerRewardsByQrCode,
  getStaffItems,
};
