import { deleteProductCategoryFranchiseSvc } from "../services/delete.service";

export const deleteProductCategoryFranchiseUsecase = async (
  id: string | number,
) => {
  return await deleteProductCategoryFranchiseSvc(id);
};
