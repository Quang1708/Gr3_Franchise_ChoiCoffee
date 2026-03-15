import type { Product } from "@/models/product.model";

export interface GetProductResponse {
  success: boolean;
  data: Product;
}
