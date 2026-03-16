import type { CategoryUpdateRequest } from "../models/categoryRequest.model";
import { updateCategoryService } from "../services/category04.service";

export const updateCategoryUsecase = async (
  id: string | number,
  payload: CategoryUpdateRequest,
) => {
  return updateCategoryService(id, payload);
};
