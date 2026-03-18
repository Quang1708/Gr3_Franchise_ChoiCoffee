import { cart06Service } from "../services/cart06.service";

export const countItemInCart = async (cartId: string) => {
    try {
        const response = await cart06Service(cartId);
        if(response){
            return response.data;
        }
    } catch (error) {
        console.error("Error counting items in cart:", error);
        throw error;
    }
};