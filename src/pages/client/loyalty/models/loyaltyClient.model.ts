export interface LoyaltyTierBenefit {
  order_discount_percent: number;
  earn_multiplier: number;
  free_shipping: boolean;
}

export interface LoyaltyTierRule {
  _id?: string;
  tier: string;
  min_points: number;
  max_points?: number;
  benefit: LoyaltyTierBenefit;
}

export interface FranchiseLoyaltyRule {
  _id: string;
  franchise_id: string;
  earn_amount_per_point: number;
  redeem_value_per_point: number;
  min_redeem_points: number;
  max_redeem_points: number;
  tier_rules: LoyaltyTierRule[];
  description: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerSummary {
  _id: string;
  email?: string;
  phone?: string;
  name?: string;
}

export interface FranchiseSummary {
  _id: string;
  name?: string;
}

export interface CustomerLoyalty {
  _id: string;
  customer_id: string | CustomerSummary;
  franchise_id: string | FranchiseSummary;
  loyalty_points: number;
  current_tier: string;
  total_earned_points: number;
  total_orders: number;
  total_spent: number;
  is_active: boolean;
  is_deleted: boolean;
  first_order_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
