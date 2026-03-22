import type { GetProductFranchiseResponse } from "../../models/productFranchise/getProductFranchise.model";
import { getProductFranchiseService } from "../../services/productFranchise/productFranchise03.service";

export const getProductFranchiseUsecase = async (
    id: string
): Promise<GetProductFranchiseResponse> => {
    try {
        if (!id) {
            throw new Error("ID is required");
        }
        const res = await getProductFranchiseService(id);
        return res;
    } catch (error) {
        console.error("Error in getProductFranchiseUsecase:", error);
        throw error;
    }
};