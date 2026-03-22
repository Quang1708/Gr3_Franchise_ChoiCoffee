export interface ProductFranchise {
    id: string;
    is_active: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    product_id: string;
    product_name: string;
    franchise_id: string;
    franchise_name: string;
    size: string;
    price_base: number;
}