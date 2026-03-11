import { axiosAdminClient } from "@/api";
import type { Category } from "@/models/category.model";
import type { CategoryCreateRequest } from "../models/categoryRequest.model";

export const createCategoryService = async (payload: CategoryCreateRequest) => {
  const res = await axiosAdminClient.post<{
    success: boolean;
    data: Category;
    message?: string;
  }>("/api/categories", payload);

  return res.data;
};
