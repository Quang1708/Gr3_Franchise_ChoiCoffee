import { userFranchiseRoleService } from "../services/userFranchiseRole.service.ts";

export const searchUserFranchiseRolesUsecase = async (payload: {
  searchCondition?: Record<string, unknown>;
  pageInfo?: { pageNum: number; pageSize: number };
}) => {
  return await userFranchiseRoleService.search(payload);
};
