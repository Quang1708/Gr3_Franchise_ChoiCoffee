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

export type RoleCode = "SUPER_ADMIN" | "FRANCHISE_MANAGER" | "STAFF";
export type RoleScope = "GLOBAL" | "FRANCHISE";

export interface Role {
  id: number;
  code: RoleCode;
  name: string;
  description?: string;
  scope: RoleScope;
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
