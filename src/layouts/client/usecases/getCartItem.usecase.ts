import { cart03Service } from "../services/cart03.service";

export const getCartByCustomerId = async (customerId: string) => {
    try {
        const response = await cart03Service(customerId);
        if(response){
            return response.data;
        }
    } catch (error) {
        console.error("Error fetching cart by customer ID:", error);
        throw error;
    }
}