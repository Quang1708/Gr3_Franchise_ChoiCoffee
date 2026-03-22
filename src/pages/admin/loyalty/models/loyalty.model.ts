export interface LoyaltyTierBenefit {
    order_discount_percent: number;
    earn_multiplier: number;
    free_shipping: boolean;
}

export interface LoyaltyTierRule {
    tier: string;
    min_points: number;
    max_points: number;
    benefit: LoyaltyTierBenefit;
}

export interface LoyaltyRule {
    id: string;
    is_active: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    franchise_id: string | number;
    franchise_name: string;
    earn_amount_per_point: string | number;
    redeem_value_per_point: string | number;
    min_redeem_points: number;
    max_redeem_points: number;
    tier_rules: LoyaltyTierRule[];
    description: string;
}