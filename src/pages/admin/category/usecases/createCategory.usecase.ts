import type { CategoryCreateRequest } from "../models/categoryRequest.model";
import { createCategoryService } from "../services/category01.service";

export const createCategoryUsecase = async (payload: CategoryCreateRequest) => {
  return createCategoryService(payload);
};
