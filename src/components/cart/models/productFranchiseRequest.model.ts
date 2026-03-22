export type SearchProductFranchiseRequest = {
    searchCondition: {
        product_id?: string;
        franchise_id?: string;
        size?: string;
        price_from?: number;
        price_to?: number;
        is_active?: boolean;
        is_deleted?: boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    }
}