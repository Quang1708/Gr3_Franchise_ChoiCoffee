import { getProducts } from "@/services/product.service";

export const getProductsService = async () => {
  return await getProducts();
};
