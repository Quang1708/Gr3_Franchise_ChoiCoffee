import type { Promotion } from '@/models/promotion.model';

export const PROMOTION_SEED_DATA: Promotion[] = [
    // 1. Giảm 10% toàn cửa hàng Quận 1 - Người tạo: Trân (Admin - ID: 1)
    {
        id: 1,
        franchiseId: 1,
        productFranchiseId: null,
        type: 'PERCENT',
        value: 10,
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-12-31T23:59:59Z',
        createdBy: 1,
        isActive: true,
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    // 2. Giảm 20,000đ cho Cà phê sữa đá tại Quận 7 - Người tạo: Đăng Quang (Manager - ID: 3)
    {
        id: 2,
        franchiseId: 2,
        productFranchiseId: 22, // ID của Cà phê sữa tại CN Quận 7
        type: 'FIXED',
        value: 20000,
        startTime: '2024-05-01T00:00:00Z',
        endTime: '2024-05-31T23:59:59Z',
        createdBy: 3,
        isActive: true,
        isDeleted: false,
        createdAt: '2024-05-01T08:00:00Z',
        updatedAt: '2024-05-01T08:00:00Z',
    },
    // 3. Giảm 15% cho Matcha đá xay tại Hà Nội - Người tạo: Nhật Quang (Manager - ID: 4)
    {
        id: 3,
        franchiseId: 3,
        productFranchiseId: 33, // Giả sử ID Matcha tại CN Hà Nội là 33
        type: 'PERCENT',
        value: 15,
        startTime: '2024-06-01T00:00:00Z',
        endTime: '2024-06-15T23:59:59Z',
        createdBy: 4,
        isActive: true,
        isDeleted: false,
        createdAt: '2024-05-25T08:00:00Z',
        updatedAt: '2024-05-25T08:00:00Z',
    }
];