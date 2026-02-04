import type { UserFranchiseRole } from '@/models/user_franchise_role.model';

export const USER_FRANCHISE_ROLE_SEED_DATA: UserFranchiseRole[] = [
    {
        id: 1,
        franchiseId: null, // GLOBAL
        roleId: 1,
        userId: 1,
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },

    {
        id: 2,
        franchiseId: 1, // Chi nhánh Q1
        roleId: 2,
        userId: 2, // Phúc
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 3,
        franchiseId: 2, // Chi nhánh Q7
        roleId: 2,
        userId: 3, // Đăng Quang
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 4,
        franchiseId: 3, // Chi nhánh Hoàn Kiếm
        roleId: 2,
        userId: 4, // Nhật Quang
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },

    {
        id: 5,
        franchiseId: 1, // Chi nhánh Q1
        roleId: 3,
        userId: 5, // Dương
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 6,
        franchiseId: 1, // Chi nhánh Q1
        roleId: 3,
        userId: 6, // Tín
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 7,
        franchiseId: 2, // Chi nhánh Q7
        roleId: 3,
        userId: 7, // Tiến
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 8,
        franchiseId: 2, // Chi nhánh Q7
        roleId: 3,
        userId: 8, // Tài
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 9,
        franchiseId: 3, // Chi nhánh Hoàn Kiếm
        roleId: 3,
        userId: 9, // Khoa
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    }
];