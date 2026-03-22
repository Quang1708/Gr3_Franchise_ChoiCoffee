import { removeOptionService } from "../services/removeOption.service";

export const deleteOption = async (cart_item_id: string, option_product_franchise_id: string) => {
    return await removeOptionService(cart_item_id, option_product_franchise_id);
};