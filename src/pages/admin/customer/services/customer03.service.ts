import { axiosAdminClient } from "@/api";
import type { SearchCustomerResponse } from "../models/searchCustomerResponse.model";
import type { SearchCustomerRequest } from "../models/searchCustomerRequest.model";

export const searchCustomersApi = async (payload: SearchCustomerRequest) => {
    const res = await axiosAdminClient.post<SearchCustomerResponse>(
        "/api/customers/search",
        payload
    );
    return res.data;
};