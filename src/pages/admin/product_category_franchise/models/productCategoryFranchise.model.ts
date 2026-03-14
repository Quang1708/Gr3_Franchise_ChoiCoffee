export interface ProductCategoryFranchiseCreateInput {
  category_franchise_id: string;
  product_franchise_id: string;
  display_order: number;
}

export interface ProductCategoryFranchiseSearchInput {
  franchise_id?: string;
  category_id?: string;
  product_id?: string;
  is_active?: boolean;
  is_deleted?: boolean;
  pageNum?: number;
  pageSize?: number;
}
