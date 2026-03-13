import type { Customer } from "@/models/customer.model";

export interface GetCustomerResponse {
    success: boolean;
    data: Customer;
}