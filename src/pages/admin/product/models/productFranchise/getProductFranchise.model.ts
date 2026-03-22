import type { ProductFranchise } from "@/pages/admin/product/models/productFranchise/ProductFranchise.model";

export interface GetProductFranchiseResponse {
    success: boolean;
    data: ProductFranchise;
}