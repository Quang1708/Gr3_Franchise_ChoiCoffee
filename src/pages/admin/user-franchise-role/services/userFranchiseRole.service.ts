import { axiosAdminClient } from "@/api";
import type { RequestUserFranchiseRole } from "../models/requestUserFranchiseRole.model";
import type { UpdateUserFranchiseRoleRequest } from "../models/updateUserFranchiseRole.model";

export const userFranchiseRoleService = {
  async search(payload: {
    searchCondition?: Record<string, unknown>;
    pageInfo?: { pageNum: number; pageSize: number };
  }) {
    const res = await axiosAdminClient.post(
      "/api/user-franchise-roles/search",
      payload,
    );
    return res.data;
  },

  async create(payload: RequestUserFranchiseRole) {
    const res = await axiosAdminClient.post("/api/user-franchise-roles", payload);
    return res.data;
  },

  async update(id: string, payload: UpdateUserFranchiseRoleRequest) {
    const res = await axiosAdminClient.put(`/api/user-franchise-roles/${id}`, payload);
    return res.data;
  },

  async delete(id: string) {
    const res = await axiosAdminClient.delete(`/api/user-franchise-roles/${id}`);
    return res.data;
  },

  async restore(id: string) {
    const res = await axiosAdminClient.patch(
      `/api/user-franchise-roles/${id}/restore`,
    );
    return res.data;
  },

  async getDetail(id: string) {
    const res = await axiosAdminClient.get(`/api/user-franchise-roles/${id}`);
    return res.data;
  },

  async getByUserId(userId: string) {
    const res = await axiosAdminClient.get<unknown[]>(
      `/api/user-franchise-roles/user/${userId}`,
    );

    const payload = res.data;

    return {
      success: true,
      data: Array.isArray(payload) ? payload : [],
    };
  },

  async getByFranchiseId(franchiseId: string) {
    const res = await axiosAdminClient.get(
      `/api/user-franchise-roles/franchise/${franchiseId}`,
    );
    return res.data;
  },
};
