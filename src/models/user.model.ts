import type { Role } from "./role.model";

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};
