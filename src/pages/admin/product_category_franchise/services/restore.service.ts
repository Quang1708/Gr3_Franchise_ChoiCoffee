import { axiosAdminClient } from "@/api";

export const restoreProductCategoryFranchiseSvc = async (
  id: string | number,
) => {
  const res = await axiosAdminClient.patch(
    `/api/product-category-franchises/${id}/restore`,
  );
  return res.data;
};
