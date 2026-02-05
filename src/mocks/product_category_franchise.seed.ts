import type { ProductCategoryFranchise } from '@/models/product_category_franchise.model';

export const PRODUCT_CATEGORY_FRANCHISE_SEED_DATA: ProductCategoryFranchise[] = [
    // --- CHI NHÁNH 1 - DANH MỤC: CÀ PHÊ (categoryFranchiseId: 1) ---
    { 
        id: 1, 
        categoryFranchiseId: 1, 
        productFranchiseId: 1, // Đen đá
        displayOrder: 1, 
        isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' 
    },
    { 
        id: 2, 
        categoryFranchiseId: 1, 
        productFranchiseId: 2, // Sữa đá
        displayOrder: 2, 
        isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' 
    },

    // --- CHI NHÁNH 1 - DANH MỤC: TRÀ TRÁI CÂY (categoryFranchiseId: 2) ---
    { 
        id: 3, 
        categoryFranchiseId: 2, 
        productFranchiseId: 3, // Trà đào cam sả (giả sử ID liên kết là 3)
        displayOrder: 1, 
        isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' 
    },

    // --- CHI NHÁNH 1 - DANH MỤC: ĐÁ XAY (categoryFranchiseId: 3) ---
    { 
        id: 4, 
        categoryFranchiseId: 3, 
        productFranchiseId: 4, // Matcha đá xay
        displayOrder: 1, 
        isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' 
    },

    // --- CHI NHÁNH 1 - DANH MỤC: THỨC ĂN (categoryFranchiseId: 4) ---
    { 
        id: 5, 
        categoryFranchiseId: 4, 
        productFranchiseId: 5, // Tiramisu
        displayOrder: 1, 
        isActive: true, isDeleted: false, createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-01-01T08:00:00Z' 
    }
];