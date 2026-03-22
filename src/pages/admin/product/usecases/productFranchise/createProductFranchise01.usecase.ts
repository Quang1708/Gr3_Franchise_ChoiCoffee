import type { CreateProductFranchiseRequest, CreateProductFranchiseResponse } from "@/pages/admin/product/models/productFranchise/createProductFranchise.model";
import { createProductFranchiseService } from "@/pages/admin/product/services/productFranchise/productFranchise01.service";

export const createProductFranchiseUsecase = async (
    request: CreateProductFranchiseRequest
): Promise<CreateProductFranchiseResponse> => {
    try {
        // Logic: Nếu size trống thì mặc định set là "DEFAULT" theo spec
        const payload = {
            ...request,
            size: request.size || "DEFAULT"
        };

        const res = await createProductFranchiseService(payload);
        return res;
    } catch (error) {
        console.error("Error in createProductFranchiseUsecase:", error);
        throw error;
    }
};