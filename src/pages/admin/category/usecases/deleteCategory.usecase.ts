import { deleteCategoryService } from "../services/category05.service";

export const deleteCategoryUsecase = async (id: string | number) => {
  return deleteCategoryService(id);
};
