export interface User {
  id: string | number;
  email: string;
  name: string;
  phone: string;
  avatar_url?: string;
  roleCode?: string;
  is_active: boolean;
  is_deleted: boolean;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}