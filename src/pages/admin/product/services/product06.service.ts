import type { ProductId } from "@/services/product.service";
import { restoreProduct } from "@/services/product.service";

export const restoreProductService = async (id: ProductId) => {
  return await restoreProduct(id);
};
