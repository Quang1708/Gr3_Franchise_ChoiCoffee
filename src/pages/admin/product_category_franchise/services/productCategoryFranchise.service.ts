import { axiosAdminClient } from "@/api";
import type { ProductCategoryFranchise } from "@/models/product_category_franchise.model";
import type { PageInfo } from "@/models/product_franchise.model";
import type {
  ProductCategoryFranchiseCreateInput,
  ProductCategoryFranchiseSearchInput,
} from "../schema/productCategoryFranchise.schema";

export interface ProductCategoryFranchiseSearchResponse {
  success: boolean;
  data: ProductCategoryFranchise[];
  pageInfo: PageInfo;
}

export interface ProductCategoryFranchiseReorderPayload {
  category_franchise_id: string;
  item_id: string;
  new_position: number;
}

export interface ProductCategoryFranchiseReorderResponse {
  success: boolean;
  data: null;
}

// Lấy danh sách (search + phân trang)
export const searchProductCategoryFranchisesService = async (
  payload: ProductCategoryFranchiseSearchInput,
) => {
  const res = await axiosAdminClient.post<ProductCategoryFranchiseSearchResponse>(
    "/api/product-category-franchises/search",
    payload,
  );

  return res.data;
};

// Tạo mới mapping product_category_franchise
export const createProductCategoryFranchiseService = async (
  payload: ProductCategoryFranchiseCreateInput,
) => {
  const res = await axiosAdminClient.post<{
    success: boolean;
    data: ProductCategoryFranchise;
  }>("/api/product-category-franchises", payload);

  return res.data;
};

// Lấy chi tiết 1 item
export const getProductCategoryFranchiseDetailService = async (
  id: string,
) => {
  const res = await axiosAdminClient.get<{
    success: boolean;
    data: ProductCategoryFranchise;
  }>(`/api/product-category-franchises/${id}`);

  return res.data;
};

// Xóa mềm 1 item
export const deleteProductCategoryFranchiseService = async (id: string) => {
  const res = await axiosAdminClient.delete(
    `/api/product-category-franchises/${id}`,
  );
  return res.data;
};

// Khôi phục item đã xóa
export const restoreProductCategoryFranchiseService = async (id: string) => {
  const res = await axiosAdminClient.patch(
    `/api/product-category-franchises/${id}/restore`,
  );
  return res.data;
};

// Đổi trạng thái hoạt động
export const updateProductCategoryFranchiseStatusService = async (
  id: string,
  is_active: boolean,
) => {
  const res = await axiosAdminClient.patch(
    `/api/product-category-franchises/${id}/status`,
    { is_active },
  );

  return res.data;
};

export const reorderProductCategoryFranchisesService = async (
  payload: ProductCategoryFranchiseReorderPayload,
) => {
  const res = await axiosAdminClient.put<ProductCategoryFranchiseReorderResponse>(
    "/api/product-category-franchises/reorder",
    payload,
  );

  return res.data;
};

