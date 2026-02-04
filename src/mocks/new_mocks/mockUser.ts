import type {
  Role,
  User,
  UserFranchiseRole,
} from "../../models/new_models/user.model";

export const MOCK_ROLES: Role[] = [
  {
    id: 1,
    code: "SUPER_ADMIN",
    name: "Super Admin",
    scope: "GLOBAL",
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    code: "FRANCHISE_MANAGER",
    name: "Franchise Manager",
    scope: "FRANCHISE",
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 3,
    code: "STAFF",
    name: "Staff",
    scope: "FRANCHISE",
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const MOCK_USERS: User[] = [
  {
    id: 1,
    email: "admin@gmail.com",
    passwordHash: "123456",
    name: "Admin User",
    phone: "0123456789",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    email: "manager@gmail.com",
    passwordHash: "123456",
    name: "Manager Central",
    phone: "0987654321",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
  },
  {
    id: 3,
    email: "staff@central.com",
    passwordHash: "hashed_password_3",
    name: "Staff Central",
    phone: "0912345678",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-03T00:00:00Z",
    updatedAt: "2023-01-03T00:00:00Z",
  },
];

export const MOCK_USER_ROLES: UserFranchiseRole[] = [
  {
    id: 1,
    userId: 1,
    roleId: 1, // SUPER_ADMIN
    franchiseId: null,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    userId: 2,
    roleId: 2, // FRANCHISE_MANAGER
    franchiseId: 1, // Central
    isDeleted: false,
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
  },
  {
    id: 3,
    userId: 3,
    roleId: 3, // STAFF
    franchiseId: 1, // Central
    isDeleted: false,
    createdAt: "2023-01-03T00:00:00Z",
    updatedAt: "2023-01-03T00:00:00Z",
  },
];
