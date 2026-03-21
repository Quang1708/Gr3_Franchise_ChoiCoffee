import { axiosAdminClient } from "@/api";

export type AddOptionRequest = {
    cart_item_id: string;
    options: {
        product_franchise_id: string;
        quantity: number;
    }[];
}


export const addOptionService = async (data: AddOptionRequest) => {
    try{
        const response = await axiosAdminClient.post(
            `/api/carts/items/update-options-cart-item`,
            data
        );
        if(response.data) {
            return response.data;
        }
    }
    catch (error) {
        console.error("Lỗi khi thêm tùy chọn sản phẩm vào giỏ hàng:", error);
        throw error;
    }
}