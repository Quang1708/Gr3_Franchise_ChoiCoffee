import { axiosAdminClient } from "@/api";

export const getDeliveryByOrderId = async (orderId: string) => {
    try{
        const response = await axiosAdminClient.get(`/api/deliveries/order/${orderId}`);
        if(response.data) {
            return response.data;
        }
    }catch(error){
        console.error("Lỗi khi lấy thông tin giao hàng:", error);
        throw error;
    }
}