import { axiosClient } from "@/api";

export const cancelCartService = async (cartId: string) => {
  try {
    const response = await axiosClient.put(`/api/carts/${cartId}/cancel`, {});
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Loi khi huy gio hang:", error);
    throw error;
  }
};
