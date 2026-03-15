import type { ProductId } from "@/services/product.service";
import { updateProduct } from "@/services/product.service";
import type { UpdateRequestProduct } from "../models";

export const updateProductService = async (
  id: ProductId,
  payload: UpdateRequestProduct,
) => {
  return await updateProduct(id, payload);
};
