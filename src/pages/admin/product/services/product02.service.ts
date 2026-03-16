import { productApi } from "@/api";
import type { SearchProductRequest } from "../models";

export const searchProductsService = async (payload: SearchProductRequest) => {
  const res = await productApi.searchByRequest(payload);
  return res.data;
};
