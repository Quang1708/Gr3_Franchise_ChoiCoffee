import type { UpdateUserFranchiseRoleRequest } from "../models/updateUserFranchiseRole.model";
import { userFranchiseRoleService } from "../services/userFranchiseRole.service.ts";

export const updateUserFranchiseRoleUsecase = async (
  id: string,
  payload: UpdateUserFranchiseRoleRequest,
) => {
  return await userFranchiseRoleService.update(id, payload);
};
