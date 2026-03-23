import { axiosAdminClient } from "@/api";

export const getPayment = async (orderId: string) => {
     try{
        const response = await axiosAdminClient.get(
            `/api/payments/order/${orderId}`);
        if(response){
            return response.data;
        }
    }catch(error){
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
        throw error;
    }
};
   
    

export const confirmPayment = async (id: string, method: string, providerTxnId?: string) => {
    try {
        const response = await axiosAdminClient.put(`/api/payments/${id}/confirm`, {
            method: method,
            provider_txn_id: providerTxnId,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi xác nhận thanh toán:", error);
        throw error;
    }
};