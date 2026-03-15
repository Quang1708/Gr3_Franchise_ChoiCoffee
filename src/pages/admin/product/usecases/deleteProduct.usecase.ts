import type { ProductId } from "@/services/product.service";
import { deleteProductService } from "../services/product05.service";

export const deleteProductUsecase = async (id: ProductId) => {
  return await deleteProductService(id);
};
