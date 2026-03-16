import type { RequestProduct } from "../models";
import { createProductService } from "../services/product01.service";

export const createProductUsecase = async (payload: RequestProduct) => {
  return await createProductService(payload);
};
