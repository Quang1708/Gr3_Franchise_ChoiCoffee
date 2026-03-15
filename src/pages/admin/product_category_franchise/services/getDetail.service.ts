import { axiosAdminClient } from "@/api";
import type { ProductCategoryFranchise } from "@/models/product_category_franchise.model";

export const getProductCategoryFranchiseDetailService = async (
  id: string | number,
) => {
  const res = await axiosAdminClient.get<{
    success: boolean;
    data: ProductCategoryFranchise;
  }>(`/api/product-category-franchises/${id}`);
  return res.data;
};
