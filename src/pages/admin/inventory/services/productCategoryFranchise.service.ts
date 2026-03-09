/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosAdminClient } from "@/api";


export const productCategoryFranchiseService = {

  create: (data: any) =>
    axiosAdminClient.post("/api/product-category-franchises", data),

  search: (data: any) =>
    axiosAdminClient.post("/api/product-category-franchises/search", data),

  get: (id: string) =>
    axiosAdminClient.get(`/api/product-category-franchises/${id}`),

  delete: (id: string) =>
    axiosAdminClient.delete(`/api/product-category-franchises/${id}`),

  restore: (id: string) =>
    axiosAdminClient.patch(`/api/product-category-franchises/restore`, { id }),

  changeStatus: (id: string, isActive: boolean) =>
    axiosAdminClient.patch(`/api/product-category-franchises/status`, {
      id,
      isActive
    }),

  reorder: (data: any) =>
    axiosAdminClient.patch(
      `/api/product-category-franchises/reorder`,
      data
    )
}