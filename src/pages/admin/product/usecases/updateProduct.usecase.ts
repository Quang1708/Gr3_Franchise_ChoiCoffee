import type {
  ProductId,
} from "@/services/product.service";
import type { UpdateRequestProduct } from "../models";
import { updateProductService } from "../services/product04.service";

export const updateProductUsecase = async (
  id: ProductId,
  payload: UpdateRequestProduct,
) => {
  return await updateProductService(id, payload);
};
