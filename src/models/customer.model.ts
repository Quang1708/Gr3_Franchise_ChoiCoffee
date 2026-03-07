export interface Customer {
  id: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
  address: string;
  is_verified: boolean;
}