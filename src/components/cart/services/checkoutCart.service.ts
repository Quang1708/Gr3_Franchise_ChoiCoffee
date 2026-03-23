import { axiosAdminClient } from "@/api";
import type { CartCheckoutRequest } from "../models/cartCheckout.model";

export const checkoutCartService = async (cartId: string, checkoutData: CartCheckoutRequest) => {
    try {
        const response = await axiosAdminClient.put(
            `/api/carts/${cartId}/checkout`
        , checkoutData);
        if(response ) return response.data;
    } catch (error) {
        console.error("Lỗi khi thanh toán giỏ hàng:", error);
        throw error;
    }
};