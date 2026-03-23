import { axiosClient } from "@/api";

export const removeItemFromFranchiseCartService = async (
  cartItemId: string,
  optionProductFranchiseId: string,
) => {
  const response = await axiosClient.patch("/api/carts/items/remove-option", {
    cart_item_id: cartItemId,
    option_product_franchise_id: optionProductFranchiseId,
  });

  return response.data;
};
