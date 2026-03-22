import { updateCartAddressService } from "../services/updateCartAddress.service";

export const updateCartAddress = async (cartId: string, address: string, phone: string, message: string) => {
   return await updateCartAddressService(cartId, address,phone, message);
}