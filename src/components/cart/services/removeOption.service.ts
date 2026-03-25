import { axiosClient } from "@/api";

export const removeOptionService = async (
  cart_item_id: string,
  option_product_franchise_id: string,
) => {
  try {
    const response = await axiosClient.patch(`/api/carts/items/remove-option`, {
      cart_item_id,
      option_product_franchise_id,
    });
    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.error("Lỗi khi xóa tùy chọn sản phẩm trong giỏ hàng:", error);
    throw error;
  }
};
