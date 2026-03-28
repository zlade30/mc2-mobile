import type { CustomerPoints, PurchaseItem } from "@/features/history";
import type { Promo } from "@/features/promos/types";
import type {
  CustomerRewards,
  RedeemableReward,
  RewardHistory,
  RewardRule,
} from "@/features/rewards/types";

const now = new Date().toISOString();
const past = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const MOCK_PROMOS: Promo[] = [
  {
    id: "demo-promo-1",
    title: "Welcome Offer",
    excerpt: "Get 2x points on your first purchase this week.",
    thumbnail_url: "",
    content: "<p>Demo promotion content. Double points on first order.</p>",
    type: "promotion",
    is_published: true,
    published_at: past(2),
    created_at: past(5),
  },
  {
    id: "demo-promo-2",
    title: "Happy Hour",
    excerpt: "Half-price pastries every Tuesday 2–4 PM.",
    thumbnail_url: "",
    content: "<p>Demo happy hour details.</p>",
    type: "announcement",
    is_published: true,
    published_at: past(1),
    created_at: past(3),
  },
  {
    id: "demo-promo-3",
    title: "New Seasonal Drink",
    excerpt: "Try our Pumpkin Spice Latte – limited time.",
    thumbnail_url: "",
    content: "<p>Seasonal drink description.</p>",
    type: "promotion",
    is_published: true,
    published_at: now,
    created_at: past(0),
  },
];

const MOCK_REWARD_RULE: RewardRule = {
  id: 1,
  name: "Free Coffee",
  reward_title: "Free Medium Coffee",
  points_required: 100,
  points_remaining: 0,
  progress_percentage: 100,
};

export const MOCK_REDEEMABLE_REWARDS: RedeemableReward[] = [
  {
    id: 1,
    name: "Free Coffee",
    reward_title: "Free Medium Coffee",
    points_required: 100,
    redeemable_count: 2,
  },
  {
    id: 2,
    name: "Free Pastry",
    reward_title: "Free Pastry of Choice",
    points_required: 150,
    redeemable_count: 1,
  },
];

const MOCK_HISTORY_ITEMS: RewardHistory[] = [
  {
    id: 101,
    points_deducted: 100,
    reward_rule: MOCK_REWARD_RULE,
    status: "claimed",
    claimed_at: past(3),
    created_at: past(3),
    expires_at: past(-7),
  },
];

export const MOCK_CUSTOMER_REWARDS: CustomerRewards = {
  current_points: 240,
  redeemable: MOCK_REDEEMABLE_REWARDS,
  history: MOCK_HISTORY_ITEMS,
  todays_reward_limit_reached: false,
};

const MOCK_PURCHASE_ITEMS_MAIN_STREET: PurchaseItem[] = [
  {
    id: "pi-1a",
    item_id: "item-1",
    item_name: "Latte",
    price: 150,
    quantity: 1,
    sku: "LATTE-M",
    total_discount: 0,
    total_money: 150,
    variant_id: "var-m",
    variant_name: "Medium",
  },
  {
    id: "pi-1b",
    item_id: "item-2",
    item_name: "Croissant",
    price: 80,
    quantity: 2,
    sku: "CROISSANT",
    total_discount: 0,
    total_money: 160,
    variant_id: "var-1",
    variant_name: "",
  },
];

const MOCK_PURCHASE_ITEMS_DOWNTOWN: PurchaseItem[] = [
  {
    id: "pi-3a",
    item_id: "item-3",
    item_name: "Americano",
    price: 120,
    quantity: 1,
    sku: "AMER-M",
    total_discount: 10,
    total_money: 110,
    variant_id: "var-m",
    variant_name: "Medium",
  },
];

export const MOCK_POINTS_HISTORY: CustomerPoints[] = [
  {
    id: 1,
    type: "earn",
    points: 50,
    balance_after: 240,
    description: "Purchase at Main Street Café",
    created_at: past(0),
    purchase_items: MOCK_PURCHASE_ITEMS_MAIN_STREET,
  },
  {
    id: 2,
    type: "reward",
    points: -100,
    balance_after: 190,
    description: "Redeemed: Free Medium Coffee",
    created_at: past(3),
    purchase_items: [],
  },
  {
    id: 3,
    type: "earn",
    points: 30,
    balance_after: 290,
    description: "Purchase at Downtown Store",
    created_at: past(5),
    purchase_items: MOCK_PURCHASE_ITEMS_DOWNTOWN,
  },
];
