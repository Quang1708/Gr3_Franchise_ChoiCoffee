import type { StaffUserRequest } from "../models/staff.model";
import { axiosAdminClient } from "@/api/axios.config";

export const getStaffByFranchiseId = async (data: StaffUserRequest) => {
    try{
        const response = await axiosAdminClient.post(
            `/api/user-franchise-roles/search`,
            data
        )
        if(response.data) {
            return response.data ;
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin nhân viên:", error);
        throw error;
    }
};