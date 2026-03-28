import { axiosAdminClient } from "@/api";

export const getVoucerByFranchiseId = async (franchiseId: number) => {
    try{
        const res = await axiosAdminClient.get(
            `/api/vouchers/franchise/${franchiseId}`
        )
        return res.data;
    } catch (error) {
        console.error("Error fetching voucher by franchise ID:", error);
        throw error;
    }
};