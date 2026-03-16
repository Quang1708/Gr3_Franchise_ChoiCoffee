import { axiosAdminClient } from "@/api";
import type { CategorySelectItem } from "@/models/category.model";

export const getCategorySelectService = async () => {
  const res = await axiosAdminClient.get<{
    success: boolean;
    data: CategorySelectItem[];
    message?: string;
  }>("/api/categories/select");

  return res.data;
};
