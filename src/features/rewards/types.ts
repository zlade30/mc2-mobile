export interface RewardRule {
  id: string | number;
  name: string;
  reward_title: string;
  points_required: number;
  points_remaining: number;
  progress_percentage: number;
}

export interface RewardDetail {
  id: string;
  sku: string;
  cost: number;
  price: number;
  item_id: string;
  quantity: number;
  item_name: string;
  line_note: string | null;
  cost_total: number;
  line_taxes: unknown[];
  variant_id: string;
  total_money: number;
  variant_name: string;
  line_discounts: unknown[];
  line_modifiers: unknown[];
  total_discount: number;
  gross_total_money: number;
}
export interface RewardHistory {
  id: string | number;
  points_deducted: number;
  reward_details: RewardDetail[];
  status: "claimed" | "expired" | "pending";
  claimed_at: string;
  created_at: string;
  expires_at: string;
}

export interface RedeemableReward {
  id: string | number;
  name: string;
  reward_title: string;
  points_required: number;
  redeemable_count: number;
}

export interface CustomerRewards {
  current_points: number;
  redeemable: RedeemableReward[];
  history: RewardHistory[];
  todays_reward_limit_reached: boolean;
}

export interface ClaimedReward {
  id: string | number;
  status: "claimed" | "expired" | "pending";
  points_deducted: number;
  reward_rule: RewardRule;
  expires_at: string;
  claimed_at: string;
  created_at: string;
}

export interface StaffItemVariant {
  variant_id: string;
  option1_value: string | null;
  option2_value: string | null;
  option3_value: string | null;
}

export interface StaffItem {
  id: string;
  name: string;
  category_id: string;
  /** Display name for the drink category (when provided by `/staff/items`). */
  category_name?: string | null;
  image_url: string | null;
  variants: StaffItemVariant[];
}
