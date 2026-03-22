import type { SearchProductFranchiseRequest } from "../models/productFranchiseRequest.model";
import { searchProductFranchiseService } from "../services/product.service";

export const searchProductFranchise = async (data: SearchProductFranchiseRequest) => {
    return await searchProductFranchiseService(data);
}