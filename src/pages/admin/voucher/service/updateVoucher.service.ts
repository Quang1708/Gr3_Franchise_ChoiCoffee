import { axiosAdminClient } from "@/api";
import type { VoucherFormData } from "../model/voucherPayload.model";

export const updateVoucher = async (id: string, data: VoucherFormData) => {
    try{
        const response = await axiosAdminClient.put(`/api/vouchers/${id}`, data);
        if(response){
            return response.data;
        }
    }catch(error){
        console.error("Failed to update voucher", error);
        throw error;
    }
};