import type {
    UpdateProductFranchiseRequest,
    UpdateProductFranchiseResponse
} from "../../models/productFranchise/updateProductFranchise.model";
import { updateProductFranchiseService } from "../../services/productFranchise/productFranchise04.service";

export const updateProductFranchiseUsecase = async (
    id: string,
    request: UpdateProductFranchiseRequest
): Promise<UpdateProductFranchiseResponse> => {
    try {
        if (!id) {
            throw new Error("ID is required for update");
        }

        const res = await updateProductFranchiseService(id, request);
        return res;
    } catch (error) {
        console.error("Error in updateProductFranchiseUsecase:", error);
        throw error;
    }
};