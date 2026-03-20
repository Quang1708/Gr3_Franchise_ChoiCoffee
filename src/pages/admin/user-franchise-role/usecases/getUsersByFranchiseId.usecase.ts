import { userFranchiseRoleService } from "../services/userFranchiseRole.service";

export const getUsersByFranchiseIdUsecase = async (franchiseId: string) => {
  return await userFranchiseRoleService.getByFranchiseId(franchiseId);
};
