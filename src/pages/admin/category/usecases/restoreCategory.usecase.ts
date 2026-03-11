import { restoreCategoryService } from "../services/category06.service";

export const restoreCategoryUsecase = async (id: string | number) => {
  return restoreCategoryService(id);
};
