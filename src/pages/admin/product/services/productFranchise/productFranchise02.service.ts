import { axiosAdminClient } from "@/api";
import type { SearchProductFranchiseRequest, SearchProductFranchiseResponse } from "@/pages/admin/product/models/productFranchise/searchProductFranchise.model";


export const searchProductFranchiseService = async (
    payload: SearchProductFranchiseRequest
): Promise<SearchProductFranchiseResponse> => {
    const response = await axiosAdminClient.post(
        "/api/product-franchises/searchInput",
        payload
    );
    return response.data;
};