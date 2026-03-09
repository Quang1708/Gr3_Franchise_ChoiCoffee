/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosAdminClient } from "@/api";

export const categoryFranchiseService = {

  create: (data: any) =>
    axiosAdminClient.post("/api/category-franchises", data),

  search: (data: any) =>
    axiosAdminClient.post("/api/category-franchises/search", data),

  get: (id: string) =>
    axiosAdminClient.get(`/api/category-franchises/${id}`),

  delete: (id: string) =>
    axiosAdminClient.delete(`/api/category-franchises/${id}`),

  restore: (id: string) =>
    axiosAdminClient.patch("/api/category-franchises/restore", { id }),

  changeStatus: (id: string, isActive: boolean) =>
    axiosAdminClient.patch("/api/category-franchises/status", { id, isActive }),

  changeDisplayOrder: (id: string, displayOrder: number) =>
    axiosAdminClient.patch("/api/category-franchises/display-order", {
      id,
      displayOrder
    }),

  getByFranchise: (franchiseId: string, onlyActive = true) =>
    axiosAdminClient.get(
      `/api/category-franchises/franchise/${franchiseId}`,
      {
        params: { onlyActive }
      }
    )
}