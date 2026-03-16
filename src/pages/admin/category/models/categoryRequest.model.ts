export interface CategoryCreateRequest {
  code: string;
  name: string;
  description?: string;
  parent_id?: string | number;
}

export interface CategoryUpdateRequest {
  code?: string;
  name?: string;
  description?: string;
  parent_id?: string | number;
  is_active?: boolean;
}
