import type { Product } from "@/models/product.model";
import { getProductDetailService } from "../services/productAdmin.service";

export const getProductDetailUsecase = async (
  productId: number | string
): Promise<Product | null> => {
  try {
    const res = await getProductDetailService(productId);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  } catch {
    return null;
  }
};
