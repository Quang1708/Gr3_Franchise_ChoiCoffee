import type { CreateUserFranchiseRoleItem } from "../models/createUserFranchiseRoleItem.model";
import { userFranchiseRoleService } from "../services/userFranchiseRole.service.ts";

export const createUserFranchiseRoleUsecase = async (payload: CreateUserFranchiseRoleItem) => {
  return await userFranchiseRoleService.create(payload);
};
