import { getProducts } from "@/services/product.service";

export const getSelectProductsService = async () => {
  return await getProducts();
};
