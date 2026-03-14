export interface SearchCondition {
  franchise_id?: string;
  category_id?: string;
  is_active?: boolean | string;
  is_deleted?: boolean | string;
}

// export interface PageInfo {
//   pageNum?: number;
//   pageSize?: number;
//   totalItems?: number;
//   totalPages?: number;
// }

export interface MenuProductRequest {
  searchCondition: SearchCondition;
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
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
  succes : boolean;
  data: CategoryItem[];
  pageInfo: {
    pageNum: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}