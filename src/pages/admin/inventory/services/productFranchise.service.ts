/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosAdminClient } from "@/api";


export const productFranchiseService = {

  create: (data: any) =>
    axiosAdminClient.post("/api/product-franchises", data),

  search: (data: any) =>
    axiosAdminClient.post("/api/product-franchises/search", data),

  get: (id: string) =>
    axiosAdminClient.get(`/api/product-franchises/${id}`),

  update: (id: string, data: any) =>
    axiosAdminClient.put(`/api/product-franchises/${id}`, data),

  delete: (id: string) =>
    axiosAdminClient.delete(`/api/product-franchises/${id}`),

  restore: (id: string) =>
    axiosAdminClient.patch(`/api/product-franchises/restore`, { id }),

  changeStatus: (id: string, isActive: boolean) =>
    axiosAdminClient.patch(`/api/product-franchises/status`, { id, isActive }),

  getByFranchise: (
    franchiseId: string,
    onlyActive = true,
    productId?: string
  ) =>
    axiosAdminClient.get(
      `/api/product-franchises/franchise/${franchiseId}`,
      {
        params: {
          onlyActive,
          productId
        }
      }
    )
}