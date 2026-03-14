import { axiosAdminClient } from "@/api";

export const deleteProductCategoryFranchiseSvc = async (
  id: string | number,
) => {
  const res = await axiosAdminClient.delete(
    `/api/product-category-franchises/${id}`,
  );
  return res.data;
};
