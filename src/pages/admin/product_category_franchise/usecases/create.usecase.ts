import type { ProductCategoryFranchiseCreateInput } from "../schema/productCategoryFranchise.schema";
import { createProductCategoryFranchiseService } from "../services/productCategoryFranchise.service";

export const createProductCategoryFranchiseUsecase = async (
  payload: ProductCategoryFranchiseCreateInput,
) => {
  return await createProductCategoryFranchiseService(payload);
};
