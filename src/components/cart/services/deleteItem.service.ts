import { axiosClient } from "@/api";

export const deleteItemService = async (cart_item_id: string) => {
  try {
    const response = await axiosClient.delete(
      `/api/carts/items/${cart_item_id}/`,
    );
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Lỗi khi xóa mục giỏ hàng:", error);
    throw error;
  }
};
