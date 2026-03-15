import { axiosAdminClient } from "@/api";
import type { ProductFranchise } from "@/models/product_franchise.model";

export interface SearchProductFranchisesResponse {
  success: boolean;
  data: ProductFranchise[];
}

export const searchProductFranchisesService = async (franchiseId = "") => {
  const res = await axiosAdminClient.post<SearchProductFranchisesResponse>(
    "/api/product-franchises/search",
    {
      searchCondition: {
        product_id: "",
        franchise_id: franchiseId,
        size: "",
        price_from: "",
        price_to: "",
        is_active: "",
        is_deleted: false,
      },
      pageInfo: { pageNum: 1, pageSize: 50 },
    },
  );
  return res.data;
};
