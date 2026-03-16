import { updateProductUsecase } from "./updateProduct.usecase";

export const updateProductStatusUsecase = async (
  id: number | string,
  isActive: boolean,
) => {
  return await updateProductUsecase(id, { isActive });
};
