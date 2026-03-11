import { searchCategoriesService } from "../services/category02.service";

export const searchCategoriesUsecase = async ({
  keyword,
  parent_id,
  is_active,
  is_deleted,
  pageNum,
  pageSize,
}: {
  keyword?: string;
  parent_id?: string | number;
  is_active?: string | boolean;
  is_deleted?: string | boolean;
  pageNum: number;
  pageSize: number;
}) => {
  return searchCategoriesService({
    searchCondition: {
      keyword: keyword ?? "",
      parent_id: parent_id ?? "",
      is_active: is_active ?? "",
      is_deleted: is_deleted ?? "",
    },
    pageInfo: {
      pageNum,
      pageSize,
    },
  });
};
