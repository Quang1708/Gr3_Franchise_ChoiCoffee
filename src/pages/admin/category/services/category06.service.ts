import { axiosAdminClient } from "@/api";
import type { Category } from "@/models/category.model";

export const restoreCategoryService = async (id: string | number) => {
  const res = await axiosAdminClient.patch<{
    success: boolean;
    data: Category;
    message?: string;
  }>(`/api/categories/${id}/restore`);

  return res.data;
};
