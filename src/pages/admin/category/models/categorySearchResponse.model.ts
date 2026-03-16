import type { Category } from "@/models/category.model";

export interface CategorySearchResponse {
  success: boolean;
  data: Category[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
}
