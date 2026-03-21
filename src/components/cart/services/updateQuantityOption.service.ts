import { axiosAdminClient } from "@/api";

export type UpdateQuantityOptionRequest = {
    cart_item_id: string;
    option_product_franchise_id: string;
    quantity: number;
};

export const updateQuantityOptionService = async (data: UpdateQuantityOptionRequest) => {
    try{
        const response = await axiosAdminClient.patch(
            `/api/carts/items/update-option`,
            data
        );
        if(response.data) {
            return response.data;
        }
    }
    catch (error) {
        console.error("Lỗi khi cập nhật số lượng tùy chọn sản phẩm trong giỏ hàng:", error);
        throw error;
    }
}