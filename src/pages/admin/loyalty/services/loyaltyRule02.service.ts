import { axiosAdminClient } from "@/api";
import type { SearchLoyaltyRequest, SearchLoyaltyResponse } from "@/pages/admin/loyalty/models/searchLoyalty.model";

export const searchLoyaltyRulesService = async (payload: SearchLoyaltyRequest): Promise<SearchLoyaltyResponse> => {
    const response = await axiosAdminClient.post("/api/loyalty-rules/search", payload);
    return response.data;
};