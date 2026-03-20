import type { ProductFranchise } from "@/pages/admin/product/models/productFranchise/ProductFranchise.model";

export interface SearchProductFranchiseRequest {
    searchCondition: {
        product_id: string;
        franchise_id: string;
        size: string;
        price_from: string | number;
        price_to: string | number;
        is_active: string | boolean;
        is_deleted: string | boolean;
    };
    pageInfo: {
        pageNum: number;
        pageSize: number;
    };
}

export interface SearchProductFranchiseResponse {
    success: boolean;
    data: ProductFranchise[];
    pageInfo: {
        pageNum: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
    };
}