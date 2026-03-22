import type { LoyaltyRule } from "./loyalty.model";

export interface GetLoyaltyResponse {
    success: boolean;
    data: LoyaltyRule;
}