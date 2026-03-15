import type { ProductId } from "@/services/product.service";
import { deleteProduct } from "@/services/product.service";

export const deleteProductService = async (id: ProductId) => {
  return await deleteProduct(id);
};
