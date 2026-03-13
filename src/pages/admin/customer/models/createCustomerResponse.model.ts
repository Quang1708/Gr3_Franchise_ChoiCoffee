export interface CreateCustomerResponse<T> {
    success: boolean;
    data?: T;
    message?: string | null;
    errors?: {
        field: string;
        message: string;
    }[];
}