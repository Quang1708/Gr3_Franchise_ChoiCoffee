import { userFranchiseRoleService } from "../services/userFranchiseRole.service.ts";

export const getUserRolesByUserIdUsecase = async (userId: string) => {
  return await userFranchiseRoleService.getByUserId(userId);
};
