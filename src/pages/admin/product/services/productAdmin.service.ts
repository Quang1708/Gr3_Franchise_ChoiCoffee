import {
  createProduct,
  deleteProduct,
  getProducts,
  restoreProduct,
  searchProducts,
  updateProduct,
  type ProductId,
} from "../../../../services/product.service";
import type { RequestProduct, UpdateRequestProduct } from "../models";

export const getProductsService = async () => {
  return await getProducts();
};

export const searchProductsService = async (keyword: string) => {
  return await searchProducts(keyword);
};

export const createProductService = async (payload: RequestProduct) => {
  return await createProduct(payload);
};

export const updateProductService = async (
  id: ProductId,
  payload: UpdateRequestProduct,
) => {
  return await updateProduct(id, payload);
};

export const deleteProductService = async (id: ProductId) => {
  return await deleteProduct(id);
};

export const restoreProductService = async (id: ProductId) => {
  return await restoreProduct(id);
};
