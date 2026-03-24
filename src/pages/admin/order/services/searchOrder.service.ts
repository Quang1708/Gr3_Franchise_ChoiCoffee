import { axiosAdminClient } from "@/api";

export const searchOrdersByCustomer = async (customerId: string, status?: string) => {
    try{
        const response = await axiosAdminClient.get(
            `/api/orders/customer/${customerId}?status=${status}`
        )
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        throw error;
    }
};

export const searchOrderByFranchiseId= async (franchise_id: string) => {
    try{
        const response = await axiosAdminClient.get(
            `/api/orders/franchise/${franchise_id}`
        )
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        throw error;
    }
}