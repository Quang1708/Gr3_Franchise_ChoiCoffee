export interface Customer {
  id: number;
  phone: string;
  email?: string;
  name: string;
  avatarUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}