import { productApi } from "@/api";
import type { SearchProductRequest, SearchProductResponse } from "../models";

export const searchProductsService = async (
  payload: SearchProductRequest
): Promise<SearchProductResponse> => {
  const res = await productApi.searchByRequest(payload);
  // res is already SearchProductResponse (productApi already unwrapped res.data)
  return res;
};
