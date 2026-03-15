import { getProductsService } from "../services/product03.service";

export const getProductsUsecase = async () => {
  return await getProductsService();
};
