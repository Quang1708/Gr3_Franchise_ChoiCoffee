export interface UpdateProductFranchiseRequest {
    size: string;
    price_base: number;
}

export interface UpdateProductFranchiseResponse {
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