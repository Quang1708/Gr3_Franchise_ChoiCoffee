import { axiosAdminClient } from "@/api";
import type { Customer } from "@/models/customer.model";

export const getCustomerDetailService = async (id: string | number) => {
    const response = await axiosAdminClient.get<{ success: boolean; data: Customer }>(
        `/api/customers/${id}`
    );
    return response.data;
};