/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosAdminClient } from "@/api"
import {
  mapFranchise,
  type Franchise,
  type FranchiseResponse,
} from "../models/franchise.model"
import { toast } from "react-toastify"

export const franchiseService = {

  async search(): Promise<Franchise[]> {
    try {
      const res = await axiosAdminClient.post<{
        success: boolean
        data: FranchiseResponse[]
        pageInfo: {
          pageNum: number
          pageSize: number
          totalItems: number
        }
      }>("/api/franchises/search", {
        searchCondition: {
          keyword: "",
          opened_at: "",
          closed_at: "",
          is_active: "",
          is_deleted: ""
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 100
        }
      })

      return res.data.data.map(mapFranchise)

    } catch (error: any) {

      const message =
        error?.response?.data?.message ||
        "Có lỗi xảy ra khi tải danh sách chi nhánh"

      toast.error(message)

      throw error
    }
  },

  async create(payload: any): Promise<Franchise> {
    const res = await axiosAdminClient.post("/api/franchises", payload)
    return mapFranchise(res.data.data)
  },

  async update(id: string, payload: any): Promise<Franchise> {
    const res = await axiosAdminClient.put(`/api/franchises/${id}`, payload)
    return mapFranchise(res.data.data)
  },

  async delete(id: string) {
    await axiosAdminClient.delete(`/api/franchises/${id}`)
  },

  async restore(id: string) {
    await axiosAdminClient.patch(`/api/franchises/${id}/restore`)
  },

  async changeStatus(id: string, active: boolean) {
    await axiosAdminClient.patch(`/api/franchises/${id}/status`, {
      is_active: active
    })
  },

async searchFranchiseApi(keyword: string): Promise<Franchise[]> {
  try {
    const res = await axiosAdminClient.post<{
      success: boolean
      data: FranchiseResponse[]
      pageInfo: {
        pageNum: number
        pageSize: number
        totalItems: number
      }
    }>("/api/franchises/search", {
      searchCondition: {
  keyword,
  is_active: "",
  is_deleted: "",
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 100,
      },
    })

    return res.data.data.map(mapFranchise)

  } catch (error: any) {

    const message =
      error?.response?.data?.message ||
      "Có lỗi xảy ra khi tìm kiếm chi nhánh"

    toast.error(message)

    throw error
  }
}

}