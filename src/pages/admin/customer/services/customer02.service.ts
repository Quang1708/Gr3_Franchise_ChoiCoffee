import { axiosAdminClient } from "@/api";
import type { Customer } from "@/models/customer.model";
import type { CreateCustomerResponse } from "../models/createCustomerResponse.model";
import type { RequestCustomer } from "../models/requestCustomer.model";

export const createCustomerService = async (payload: RequestCustomer) => {
    const response = await axiosAdminClient.post<CreateCustomerResponse<Customer>>(
        "/api/customers",
        payload
    );
    return response.data;
};