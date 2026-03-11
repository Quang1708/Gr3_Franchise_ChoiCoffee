import { axiosAdminClient } from "@/api";
import type { Category } from "@/models/category.model";
import type { CategoryUpdateRequest } from "../models/categoryRequest.model";

export const updateCategoryService = async (
  id: string | number,
  payload: CategoryUpdateRequest,
) => {
  const res = await axiosAdminClient.put<{
    success: boolean;
    data: Category;
    message?: string;
  }>(`/api/categories/${id}`, payload);

  return res.data;
};
