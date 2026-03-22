import type { LoyaltyRule } from "@/pages/admin/loyalty/models/loyalty.model";

export interface SearchLoyaltyRequest {
    searchCondition: {
        franchise_id?: string | number;
        earn_amount_per_point?: number | string;
        redeem_value_per_point?: number | string;
        tier?: string;
        is_active?: string | boolean;
        is_deleted?: string | boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}

export interface SearchLoyaltyResponse {
    success: boolean;
    data: LoyaltyRule[];
    pageInfo: {
        pageNum: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}