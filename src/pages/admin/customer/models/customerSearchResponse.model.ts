import type { Customer } from "@/models/customer.model";

export interface CustomerSearchResponse {
    success: boolean;
    data: Customer[];
    pageInfo: {
        pageNum: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}