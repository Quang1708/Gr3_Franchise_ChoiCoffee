import type { RequestUserFranchiseRole } from "../models/requestUserFranchiseRole.model";
import { userFranchiseRoleService } from "../services/userFranchiseRole.service.ts";

export const createUserFranchiseRoleUsecase = async (payload: RequestUserFranchiseRole) => {
  return await userFranchiseRoleService.create(payload);
};
