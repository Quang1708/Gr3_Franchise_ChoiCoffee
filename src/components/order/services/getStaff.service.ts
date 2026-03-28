import { axiosAdminClient } from "@/api/axios.config";

export const getStaffByFranchiseId = async (id: string) => {
    try{
        const response = await axiosAdminClient.get(
            `/api/user-franchise-roles/franchise/${id}`,
        )
        if(response.data) {
            return response.data ;
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin nhân viên:", error);
        throw error;
    }
};