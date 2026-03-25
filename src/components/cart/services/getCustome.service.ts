import { axiosAdminClient } from "@/api";


export const getCustomer = async (customerId: string) => {
    try{
        const response = await axiosAdminClient.get(`/api/customers/${customerId}`);
        if(response.data) {
            return response.data;
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin khách hàng:", error);
        throw error;
    }
}