import { axiosAdminClient } from "@/api";
import type { Customer } from "@/models/customer.model";
import type { CustomerRequest } from "../models/customerRequest.model";

export const createCustomerService = async (payload: CustomerRequest) => {
    const response = await axiosAdminClient.post<{ success: boolean; data: Customer }>(
        "/api/customers",
        payload
    );
    return response.data;
};