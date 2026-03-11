export interface SearchCustomerRequest {
    searchCondition: {
        keyword?: string;
        is_active?: string | boolean;
        is_deleted?: string | boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}