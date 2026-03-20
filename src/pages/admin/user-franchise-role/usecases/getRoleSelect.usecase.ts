import { getRoleSelectService } from "../services/roleSelect.service";

export const getRoleSelectUsecase = async () => {
  return await getRoleSelectService();
};
