import { userFranchiseRoleService } from "../services/userFranchiseRole.service.ts";

export const deleteUserFranchiseRoleUsecase = async (id: string) => {
  return await userFranchiseRoleService.delete(id);
};
