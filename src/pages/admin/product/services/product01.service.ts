import { createProduct } from "@/services/product.service";
import type { RequestProduct } from "../models";

export const createProductService = async (payload: RequestProduct) => {
  return await createProduct(payload);
};
