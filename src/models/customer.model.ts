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

// Customer authentication profile (for store)
export interface CustomerAuthProfile {
  id: number | string;
  email?: string;
  phone: string;
  name: string;
  avatarUrl?: string;
  address?: string;
}
