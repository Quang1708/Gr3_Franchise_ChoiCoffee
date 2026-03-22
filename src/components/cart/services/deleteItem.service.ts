import { axiosAdminClient } from "@/api";

export const deleteItemService = async (cartId: string) => {
    try {
        const response = await axiosAdminClient.delete(
            `/api/carts/items/${cartId}/`);
        if(response.data) {
            return response.data;
        }
    } catch (error) {
        console.error("Lỗi khi xóa mục giỏ hàng:", error);
        throw error;
    }
};