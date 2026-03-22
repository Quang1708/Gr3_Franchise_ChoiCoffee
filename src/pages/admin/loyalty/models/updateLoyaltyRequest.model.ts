import type { LoyaltyTierRule } from "./loyalty.model";

export interface UpdateLoyaltyRuleRequest {
    id: string | number;
    earn_amount_per_point: number;
    redeem_value_per_point: number;
    min_redeem_points: number;
    max_redeem_points: number;
    tier_rules: LoyaltyTierRule[]
    description: string;
    franchise_id: string; 
}