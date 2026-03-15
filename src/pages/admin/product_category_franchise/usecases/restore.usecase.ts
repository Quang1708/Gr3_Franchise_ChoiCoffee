import { restoreProductCategoryFranchiseSvc } from "../services/restore.service";

export const restoreProductCategoryFranchiseUsecase = async (
  id: string | number,
) => {
  return await restoreProductCategoryFranchiseSvc(id);
};
