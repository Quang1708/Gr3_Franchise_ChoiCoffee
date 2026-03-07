import { axiosAdminClient } from "@/api";
import type { CustomerSearchResponse } from "@/pages/admin/customer/models/customerSearchResponse.model";

export const searchCustomersApi = async (payload: {
    searchCondition: {
        keyword?: string;
        is_active?: string | boolean;
        is_deleted?: string | boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}) => {
    const res = await axiosAdminClient.post<CustomerSearchResponse>(
        "/api/customers/search",
        payload
    );

    return res.data;
};