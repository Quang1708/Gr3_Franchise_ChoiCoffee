import { axiosAdminClient } from "@/api";
import type { CategorySearchResponse } from "../models/categorySearchResponse.model";

export const searchCategoriesService = async (payload: {
  searchCondition: {
    keyword?: string;
    parent_id?: string | number;
    is_active?: string | boolean;
    is_deleted?: string | boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}) => {
  const res = await axiosAdminClient.post<CategorySearchResponse>(
    "/api/categories/search",
    payload,
  );

  return res.data;
};
