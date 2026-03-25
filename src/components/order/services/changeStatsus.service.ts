import { axiosAdminClient } from "@/api";

export const prepareStatus = async (orderId: string) => {
    try{
        const response = await axiosAdminClient.put(`/api/orders/${orderId}/preparing`);
        if(response.data) {
            return response.data;
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        throw error;
    }
}

export const readyPickupStatus = async (orderId: string, staff_id: string) => {
    try{
        const response = await axiosAdminClient.put(`/api/orders/${orderId}/ready-for-pickup`, { staff_id });
        if(response.data) {
            return response.data;
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        throw error;
    }   
}

export const pickupStatus = async (deliveryId: string) => {
    try{
        const response = await axiosAdminClient.put(`/api/deliveries/${deliveryId}/pickup`);
        if(response.data) {
            return response.data;
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái giao hàng:", error);
        throw error;
    }
};

export const completeStatus = async (deliveryId: string) => {
    try{
        const response = await axiosAdminClient.put(`/api/deliveries/${deliveryId}/complete`);
        if(response.data) {
            return response.data;
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái giao hàng:", error);
        throw error;
    }
};