import type { ProductCategoryFranchiseCreateInput } from "../schema/productCategoryFranchise.schema";
import { createProductCategoryFranchiseService } from "../services/productCategoryFranchise.service";

export const createProductCategoryFranchiseUsecase = async (
  payload: ProductCategoryFranchiseCreateInput,
) => {
  try {
    const res = await createProductCategoryFranchiseService(payload);
    return res;
  } catch (error) {
    console.error("Create ProductCategoryFranchise Usecase Error:", error);
    return { success: false, data: null };
  }
};
