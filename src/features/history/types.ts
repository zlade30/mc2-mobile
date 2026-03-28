export interface PurchaseItem {
  id: string;
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  sku: string;
  total_discount: number;
  total_money: number;
  variant_id: string;
  variant_name: string;
}

export interface CustomerPoints {
  id: number;
  type: "earn" | "reward";
  points: number;
  balance_after: number;
  purchase_items: PurchaseItem[];
  description: string;
  created_at: string;
}
