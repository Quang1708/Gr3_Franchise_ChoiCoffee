import type { SearchLoyaltyRequest, SearchLoyaltyResponse } from "@/pages/admin/loyalty/models/searchLoyalty.model";
import { searchLoyaltyRulesService } from "@/pages/admin/loyalty/services/loyaltyRule02.service";

export const searchLoyaltyRulesUsecase = async (
    request: SearchLoyaltyRequest
): Promise<SearchLoyaltyResponse> => {
    try {
        const res = await searchLoyaltyRulesService(request);
        return res;
    } catch (error) {
        console.error("Error in searchLoyaltyRulesUsecase:", error);
        throw error;
    }
};