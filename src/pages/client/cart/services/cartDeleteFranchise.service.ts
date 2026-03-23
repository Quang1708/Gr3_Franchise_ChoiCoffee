import { axiosClient } from "@/api/axios.config";

export const deleteFranchiseCartService = async (cartItemIds: string[]) => {
  const response = await axiosClient.delete("/api/carts/items", {
    data: {
      cart_item_ids: cartItemIds,
    },
  });
  return response.data;
};
