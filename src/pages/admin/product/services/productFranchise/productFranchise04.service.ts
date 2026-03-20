import { axiosAdminClient } from "@/api";
import type {
    UpdateProductFranchiseRequest,
    UpdateProductFranchiseResponse
} from "../../models/productFranchise/updateProductFranchise.model";

export const updateProductFranchiseService = async (
    id: string,
    payload: UpdateProductFranchiseRequest
): Promise<UpdateProductFranchiseResponse> => {
    const response = await axiosAdminClient.put(
        `/api/product-franchises/${id}`,
        payload
    );
    return response.data;
};