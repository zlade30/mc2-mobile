export type UserRole = "customer" | "staff";

export interface Permission {
  id: number;
  name: string;
  display_name: string;
  group: string;
}

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: Permission[];
}

export interface LoyaltyPoint {
  total_points: number;
  lifetime_points: number;
}

export interface RewardProgressItem {
  rule_id: string;
  name: string;
  reward_title: string;
  points_required: number;
  current_points: number;
  points_remaining: number;
  progress_percentage: number;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  hashed_id: string;
  roles: Role[];
  email_verified_at: string | null;
  loyalty_point: LoyaltyPoint | null;
  reward_progress: RewardProgressItem[] | null;
  created_at: string;
}
