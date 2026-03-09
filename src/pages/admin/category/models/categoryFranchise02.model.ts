export interface SearchCondition {
  franchise_id?: string;
  category_id?: string;
  is_active?: boolean | string;
  is_deleted?: boolean;
}

export interface PageInfo {
  pageNum?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface MenuProductRequest {
  searchCondition: SearchCondition;
  pageInfo: PageInfo;
}

export interface CategoryItem {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;

  category_id: string;
  category_name: string;

  franchise_id: string;
  franchise_name: string;

  display_order: number;
}

export interface CategoryResponse {
  data: CategoryItem[];
  pageInfo: PageInfo;
}