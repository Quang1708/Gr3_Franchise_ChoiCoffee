import type { Product } from "@/models/product.model";

export interface SearchProductResponse {
  success: boolean;
  data: Product[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
