import { userFranchiseRoleService } from "../services/userFranchiseRole.service.ts";

export const restoreUserFranchiseRoleUsecase = async (id: string) => {
  return await userFranchiseRoleService.restore(id);
};
