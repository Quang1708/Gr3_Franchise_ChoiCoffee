import { axiosAdminClient } from "@/api";

export const updateQuantityItemService = async (cart_item_id: string, quantity: number) => {
    try {
        const response = await axiosAdminClient.patch(
            `/api/carts/items/update-cart-item`, {
                cart_item_id,
                quantity
            }
        );
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật số lượng sản phẩm trong giỏ hàng:", error);
        throw error;
    }
};