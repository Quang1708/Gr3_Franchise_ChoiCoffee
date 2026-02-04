import type { ProductFranchise } from '@/models/product_franchise.model';

export const PRODUCT_FRANCHISE_SEED_DATA: ProductFranchise[] = [
    // --- CHI NHÁNH 1 (QUẬN 1) 
    { id: 1, franchiseId: 1, productId: 1, priceBase: 35000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 2, franchiseId: 1, productId: 2, priceBase: 45000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 3, franchiseId: 1, productId: 6, priceBase: 55000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' }, // Trà đào
    { id: 4, franchiseId: 1, productId: 11, priceBase: 75000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' }, // Matcha đá xay
    { id: 5, franchiseId: 1, productId: 18, priceBase: 55000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' }, // Tiramisu

    // --- CHI NHÁNH 2 (QUẬN 7)
    { id: 21, franchiseId: 2, productId: 1, priceBase: 32000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 22, franchiseId: 2, productId: 2, priceBase: 39000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 23, franchiseId: 2, productId: 6, priceBase: 49000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },

    // --- CHI NHÁNH 3 (HÀ NỘI) 
    { id: 31, franchiseId: 3, productId: 1, priceBase: 29000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 32, franchiseId: 3, productId: 2, priceBase: 35000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' },
    { id: 33, franchiseId: 3, productId: 16, priceBase: 15000, isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' }, // Bánh mì que
];