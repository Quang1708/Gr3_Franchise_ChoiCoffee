import { axiosClient } from "@/api";

export const deleteCartItemService = async (cartItemId: string) => {
  const response = await axiosClient.delete(`/api/carts/items/${cartItemId}/`);
  return response.data;
};
