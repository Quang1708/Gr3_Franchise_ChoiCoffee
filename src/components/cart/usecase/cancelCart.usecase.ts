import { cancelCartService } from "../services/cancelCart.service";

export const cancelCart = async (cartId: string) => {
  return await cancelCartService(cartId);
};
