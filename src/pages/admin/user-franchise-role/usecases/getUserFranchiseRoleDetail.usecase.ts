import { userFranchiseRoleService } from "../services/userFranchiseRole.service.ts";

export const getUserFranchiseRoleDetailUsecase = async (id: string) => {
  return await userFranchiseRoleService.getDetail(id);
};
