export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: number;
  code: string;
  name: string;
  description?: string;
  scope: "GLOBAL" | "FRANCHISE";
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFranchiseRole {
  id: number;
  franchiseId: number | null; // null if role is GLOBAL
  roleId: number;
  userId: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
