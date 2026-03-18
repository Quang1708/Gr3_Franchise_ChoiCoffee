/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosAdminClient } from '@/api/axios.config';

export const inventoryService = {
  create: (data: any) =>
    axiosAdminClient.post("/api/inventories", data),

  search: (data: any) =>
  axiosAdminClient.post("/api/inventories/search", data),

  get: (id: string) =>
    axiosAdminClient.get(`/api/inventories/${id}`),

  delete: (id: string) =>
    axiosAdminClient.delete(`/api/inventories/${id}`),

  restore: (id: string) =>
    axiosAdminClient.patch(`/api/inventories/${id}/restore`),

  adjust: (data: any) =>  
    axiosAdminClient.post("/api/inventories/adjust", data),

  getLowStock: (franchiseId: string) =>
    axiosAdminClient.get(`/api/inventories/low-stock/franchise/${franchiseId}`),

  getLogs: (inventoryId: string) =>
    axiosAdminClient.get(`/api/inventories/logs/${inventoryId}`),

  adjustBulk: (data: any) =>
  axiosAdminClient.post("/api/inventories/adjust/bulk", data),
};