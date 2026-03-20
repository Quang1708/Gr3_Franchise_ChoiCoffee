import { httpClient } from "@/api";
import type { CreateUserFranchiseRoleItem } from "../models/createUserFranchiseRoleItem.model";
import type { UpdateUserFranchiseRoleRequest } from "../models/updateUserFranchiseRole.model";

export const userFranchiseRoleService = {
  async search(payload: { searchCondition?: Record<string, unknown>; pageInfo?: { pageNum: number; pageSize: number } }) {
    return await httpClient.post({
      url: "/api/user-franchise-roles/search",
      data: payload,
    });
  },

  async create(payload: CreateUserFranchiseRoleItem) {
    return await httpClient.post({
      url: "/api/user-franchise-roles",
      data: payload,
    });
  },

  async update(id: string, payload: UpdateUserFranchiseRoleRequest) {
    return await httpClient.put({
      url: `/api/user-franchise-roles/${id}`,
      data: payload,
    });
  },

  async delete(id: string) {
    return await httpClient.delete({
      url: `/api/user-franchise-roles/${id}`,
    });
  },

  async restore(id: string) {
    return await httpClient.patch({
      url: `/api/user-franchise-roles/${id}/restore`,
    });
  },

  async getDetail(id: string) {
    return await httpClient.get({
      url: `/api/user-franchise-roles/${id}`,
    });
  },

  async getByUserId(userId: string) {
    return await httpClient.get({
      url: `/api/user-franchise-roles/user/${userId}`,
    });
  },

  async getByFranchiseId(franchiseId: string) {
    return await httpClient.get({
      url: `/api/user-franchise-roles/franchise/${franchiseId}`,
    });
  },
};
