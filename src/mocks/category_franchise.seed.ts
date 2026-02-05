import type { CategoryFranchise } from '@/models/category_franchise.model';

export const CATEGORY_FRANCHISE_SEED_DATA: CategoryFranchise[] = [
    // --- CHI NHÁNH 1 (QUẬN 1) 
    { id: 1, franchiseId: 1, categoryId: 1, displayOrder: 1, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' }, // Cà phê
    { id: 2, franchiseId: 1, categoryId: 2, displayOrder: 2, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' }, // Trà
    { id: 3, franchiseId: 1, categoryId: 3, displayOrder: 3, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' }, // Đá xay
    { id: 4, franchiseId: 1, categoryId: 4, displayOrder: 4, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' }, // Thức ăn

    // --- CHI NHÁNH 2 (QUẬN 7) 
    { id: 5, franchiseId: 2, categoryId: 1, displayOrder: 1, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 6, franchiseId: 2, categoryId: 2, displayOrder: 2, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 7, franchiseId: 2, categoryId: 3, displayOrder: 3, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },

    // --- CHI NHÁNH 3 (HÀ NỘI) 
    { id: 8, franchiseId: 3, categoryId: 1, displayOrder: 1, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 9, franchiseId: 3, categoryId: 2, displayOrder: 2, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 10, franchiseId: 3, categoryId: 4, displayOrder: 3, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' }
];