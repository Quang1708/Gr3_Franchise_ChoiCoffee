import { axiosAdminClient } from "@/api";

export const updateProductCategoryFranchiseStatusSvc = async (
  id: string | number,
  is_active: boolean,
) => {
  if (!id) throw new Error("Missing ID");

  const res = await axiosAdminClient.patch(
    `/api/product-category-franchises/${String(id)}/status`,
    { is_active },
  );
  return res.data;
};
