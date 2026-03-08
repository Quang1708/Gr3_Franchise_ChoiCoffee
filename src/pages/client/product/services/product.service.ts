import { httpClient } from "@/api";
import type { Product } from "@/models/product.model";
import type { ProductDetail, PublicProductRequest } from "../models/product.models";

export const getPublicProducts=(params: PublicProductRequest ): Promise<Product[] | null> => {
  return httpClient.get<Product[], PublicProductRequest>({
    url: "/api/clients/products",
    params,
  });
}

export const getPublicDetailProduct=(franchiseId: string, productId: string): Promise<ProductDetail | null> => {
  return httpClient.get<ProductDetail, { franchiseId: string, productId: string }>({
    url: `/api/clients/franchises/${franchiseId}/products/${productId}`,
  });
}