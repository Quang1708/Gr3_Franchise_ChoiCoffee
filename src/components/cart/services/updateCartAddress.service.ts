import { axiosAdminClient } from "@/api";

export const updateCartAddressService = async (cartId: string, address: string,phone: string, message?: string) => {
    try{
        const response = await axiosAdminClient.put(
            `/api/carts/${cartId}`,
            {
                address,
                phone,
                message
            }
        )
        if(response){
            return response.data;
        }       
    } catch (error) {
        console.error("Error updating cart address:", error);
        throw error;
    }
};