import { axiosAdminClient } from "@/api";
import type { SearchProductFranchiseRequest } from "../models/productFranchiseRequest.model";

export const searchProductFranchiseService = async (payload: SearchProductFranchiseRequest) => {
    try{
        const response = await axiosAdminClient.post(
            "/api/product-franchises/search",
            payload);
        if (response){
            return response.data
        }
    } catch (error) {
        console.error("Error searching product franchises:", error);
        throw error;
    }
}