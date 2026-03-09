export interface Customer {
  id: number;
  phone: string;
  email?: string;
  name: string;
  avatar_url?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
