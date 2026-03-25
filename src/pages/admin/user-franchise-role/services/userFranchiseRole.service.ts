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
    const res = await axiosAdminClient.get<unknown>(
      `/api/user-franchise-roles/user/${userId}`,
    );

    const payload = res.data;

    const normalizedData = (() => {
      if (Array.isArray(payload)) return payload;
      if (!payload || typeof payload !== "object") return [];

      const source = payload as {
        data?: unknown;
        items?: unknown;
        rows?: unknown;
      };

      if (Array.isArray(source.data)) return source.data;

      if (source.data && typeof source.data === "object") {
        const nested = source.data as { items?: unknown; rows?: unknown };
        if (Array.isArray(nested.items)) return nested.items;
        if (Array.isArray(nested.rows)) return nested.rows;
      }

      if (Array.isArray(source.items)) return source.items;
      if (Array.isArray(source.rows)) return source.rows;

      return [];
    })();

    return {
      success: true,
      data: normalizedData,
    };
  },

  async getByFranchiseId(franchiseId: string) {
    const res = await axiosAdminClient.get(
      `/api/user-franchise-roles/franchise/${franchiseId}`,
    );
    return res.data;
  },
};
