export interface GetCategoryByIdResponse {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  code: string;
  name: string;
  description: string;
  parent_id?: string | null;
}