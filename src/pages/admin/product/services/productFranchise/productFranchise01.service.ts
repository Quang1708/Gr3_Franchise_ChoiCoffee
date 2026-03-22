import { axiosAdminClient } from "@/api";
import type {
    CreateProductFranchiseRequest,
    CreateProductFranchiseResponse
} from "../../models/productFranchise/createProductFranchise.model"

export const createProductFranchiseService = async (
    payload: CreateProductFranchiseRequest
): Promise<CreateProductFranchiseResponse> => {
    const response = await axiosAdminClient.post(
        "/api/product-franchises",
        payload
    );
    return response.data;
};