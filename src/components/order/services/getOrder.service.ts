import { axiosAdminClient } from "@/api";

export const getOrderDetail = async (orderId: string) => {
    try{
        const response = await axiosAdminClient.get(`/api/orders/${orderId}`);
        if(response){
            return response.data;
        }
    }catch(error){
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
        throw error;
    }
};