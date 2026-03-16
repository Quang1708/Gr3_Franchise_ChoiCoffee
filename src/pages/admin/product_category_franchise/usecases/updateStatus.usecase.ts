import { updateProductCategoryFranchiseStatusSvc } from "../services/updateStatus.service";

export const updateProductCategoryFranchiseStatusUsecase = async (
  id: string | number,
  is_active: boolean,
) => {
  return await updateProductCategoryFranchiseStatusSvc(id, is_active);
};
