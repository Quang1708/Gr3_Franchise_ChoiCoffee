import { httpClient } from "@/api";
import type { Product } from "../models/product.model";


export const getPublicProducts=(franchiseId: string, categoryId: string): Promise<Product[] | null> => {
  return httpClient.get<Product[], {
    franchiseId: string;
    categoryId: string;
  }>({
    url: `/api/clients/products?franchiseId=${franchiseId}&categoryId=${categoryId}`,
  });
}