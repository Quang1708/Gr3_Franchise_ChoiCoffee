export interface CreateProductFranchiseRequest {
    franchise_id: string;
    product_id: string;
    size: string; // "DEFAULT" nếu không có size
    price_base: number;
}

export interface CreateProductFranchiseResponse {
    success: boolean;
    data: {
        id: string;
        is_active: boolean;
        is_deleted: boolean;
        created_at: string;
        updated_at: string;
        product_id: string;
        franchise_id: string;
        size: string;
        price_base: number;
    };
}