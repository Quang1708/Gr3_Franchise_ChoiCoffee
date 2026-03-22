import type { SearchProductFranchiseRequest, SearchProductFranchiseResponse } from "@/pages/admin/product/models/productFranchise/searchProductFranchise.model";
import { searchProductFranchiseService } from "@/pages/admin/product/services/productFranchise/productFranchise02.service";

export const searchProductFranchiseUsecase = async (
    request: SearchProductFranchiseRequest
): Promise<SearchProductFranchiseResponse> => {
    try {
        const res = await searchProductFranchiseService(request);
        return res;
    } catch (error) {
        console.error("Error in searchProductFranchiseUsecase:", error);
        throw error;
    }
};