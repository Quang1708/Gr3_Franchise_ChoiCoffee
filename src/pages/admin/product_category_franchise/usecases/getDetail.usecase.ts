import { getProductCategoryFranchiseDetailService } from "../services/getDetail.service";

export const getProductCategoryFranchiseDetailUsecase = async (
  id: string | number,
) => {
  try {
    const res = await getProductCategoryFranchiseDetailService(id);
    if (!res.success) throw new Error();
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
