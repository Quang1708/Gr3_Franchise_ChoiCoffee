import type { SearchProductRequest } from "../models";
import { searchProductsService } from "../services/product02.service";

export const searchProductsUsecase = async (payload: SearchProductRequest) => {
  return await searchProductsService(payload);
};
