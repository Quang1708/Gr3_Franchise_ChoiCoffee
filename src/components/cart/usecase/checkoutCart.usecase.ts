import type { CartCheckoutRequest } from "../models/cartCheckout.model";
import { checkoutCartService } from "../services/checkoutCart.service";

export const checkoutCart = async (cartId: string, checkoutData: CartCheckoutRequest) => {  
    const response = await checkoutCartService(cartId, checkoutData);
    return response;
};