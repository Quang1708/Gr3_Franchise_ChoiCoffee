import type { ProductId } from "@/services/product.service";
import { restoreProductService } from "../services/product06.service";

export const restoreProductUsecase = async (id: ProductId) => {
  return await restoreProductService(id);
};
