import { getCategoryDetailService } from "../services/category03.service";

export const getCategoryDetailUsecase = async (id: string | number) => {
  return getCategoryDetailService(id);
};
