import { axiosAdminClient } from "@/api";
import type { SearchVoucherRequest } from "../model/voucherRequest.model";

export const searchVoucer = async (data: SearchVoucherRequest) => {
    try {
        const res = await axiosAdminClient.post(
            "/api/vouchers/search",
             data
            );
        if (res.data) {
            return res.data;
        }
    } catch (error) {
        console.error("Error searching vouchers:", error);
        throw error;
    }
};