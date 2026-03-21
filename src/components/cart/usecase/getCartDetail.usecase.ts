import { getCartDetailService } from "../services/getCartDetail.service";

export const getCartDetail = async (cartId: string) => {
    return await getCartDetailService(cartId);
};