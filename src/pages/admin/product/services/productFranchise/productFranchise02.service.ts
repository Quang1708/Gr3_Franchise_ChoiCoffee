import { axiosAdminClient } from "@/api";
import type { SearchProductFranchiseRequest, SearchProductFranchiseResponse } from "@/pages/admin/product/models/productFranchise/searchProductFranchise.model";


export const searchProductFranchiseService = async (
    payload: SearchProductFranchiseRequest
): Promise<SearchProductFranchiseResponse> => {
    const response = await axiosAdminClient.post(
        "/api/product-franchises/search",
        payload
    );
    return response.data;
};