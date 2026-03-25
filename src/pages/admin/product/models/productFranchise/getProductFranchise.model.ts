import type { ProductFranchise } from "./productFranchise.model";

export interface GetProductFranchiseResponse {
  success: boolean;
  data: ProductFranchise;
}
