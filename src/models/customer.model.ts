export interface Customer {
  id: number;
  phone: string;
  email?: string;
  name: string;
  avatar_url?: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
