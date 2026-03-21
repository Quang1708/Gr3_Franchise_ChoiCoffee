import { deleteItemService } from "../services/deleteItem.service";

export const deleteItem = async (cartId: string) => {
    return await deleteItemService(cartId);
};