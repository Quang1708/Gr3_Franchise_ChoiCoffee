import { axiosAdminClient } from "@/api";

export interface CategoryFranchiseOption {
  id: string;
  category_id: string;
  category_name: string;
  franchise_id: string;
  franchise_name: string;
}

export interface SearchCategoryFranchisesResponse {
  success: boolean;
  data: CategoryFranchiseOption[];
}

export const searchCategoryFranchisesService = async (franchiseId = "") => {
  const res = await axiosAdminClient.post<SearchCategoryFranchisesResponse>(
    "/api/category-franchises/search",
    {
      searchCondition: {
        franchise_id: franchiseId,
        category_id: "",
        is_active: "",
        is_deleted: false,
      },
      pageInfo: { pageNum: 1, pageSize: 10000 },
    },
  );
  return res.data;
};
