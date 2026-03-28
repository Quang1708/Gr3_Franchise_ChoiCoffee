import { axiosAdminClient } from "@/api";
import type { VoucherFormData } from "../model/voucherPayload.model";

export const createVoucher = async (data: VoucherFormData) => {
    try{
        const res = await axiosAdminClient.post("/api/vouchers", data);
        if(res.data){
            return res.data;
        }
    } catch (error) {
        console.error("Error creating voucher:", error);
        throw error;
    }
};