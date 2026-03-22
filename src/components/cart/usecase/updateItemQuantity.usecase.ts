import { updateQuantityItemService } from "../services/updateQuantityItem.service";

export const updateQuantityItem = async (cart_item_id: string, quantity: number) => {
    return await updateQuantityItemService(cart_item_id, quantity);
};