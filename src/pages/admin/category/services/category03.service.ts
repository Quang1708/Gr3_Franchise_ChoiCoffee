import { axiosAdminClient } from "@/api";
import type { Category } from "@/models/category.model";

export const getCategoryDetailService = async (id: string | number) => {
  const res = await axiosAdminClient.get<{
    success: boolean;
    data: Category;
    message?: string;
  }>(`/api/categories/${id}`);

  return res.data;
};
