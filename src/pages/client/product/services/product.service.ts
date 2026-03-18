import { httpClient } from "@/api";
import type { ProductDetail, PublicProductRequest, Product } from "../models/product.models";

export const getPublicProducts=async (params: PublicProductRequest ): Promise<Product[] | null> => {
  return await httpClient.get<Product[], PublicProductRequest>({
    url: "/api/clients/products",
    params,
  });
}

export const getPublicDetailProduct=(franchiseId: string, productId: string): Promise<ProductDetail | null> => {
  return httpClient.get<ProductDetail, { franchiseId: string, productId: string }>({
    url: `/api/clients/franchises/${franchiseId}/products/${productId}`,
  });
}