export interface Category {
    id: number;
    code: string;
    name: string;
    description?: string;
    parent_id?: string | number;
    is_active: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface CategorySelectItem {
    value: string | number;
    code: string;
    name: string;
}