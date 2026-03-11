import { axiosAdminClient } from "@/api";
import type { GetCustomerResponse } from "../models/getCustomerResponse.model";

export const getCustomerDetailService = async (id: string | number) => {
    const response = await axiosAdminClient.get<GetCustomerResponse>(
        `/api/customers/${id}`
    );
    return response.data;
};