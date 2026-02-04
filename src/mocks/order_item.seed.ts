import type { OrderItem } from '@/models/order_item.model';

export const ORDER_ITEM_SEED_DATA: OrderItem[] = [
    // --- CHI TIẾT ĐƠN HÀNG 1 (ID: 1 - Tổng 85,000đ) ---
    {
        id: 1,
        orderId: 1,
        productFranchiseId: 1, // Cà phê đen đá
        productNameSnapshot: 'Cà Phê Đen Đá',
        priceSnapshot: 35000,
        quantity: 1,
        lineTotal: 35000,
        isDeleted: false,
        createdAt: '2024-06-01T08:55:00Z',
        updatedAt: '2024-06-01T08:55:00Z',
    },
    {
        id: 2,
        orderId: 1,
        productFranchiseId: 5, // Tiramisu
        productNameSnapshot: 'Bánh Tiramisu',
        priceSnapshot: 50000, // Giả sử giá gốc 55k, giảm còn 50k
        quantity: 1,
        lineTotal: 50000,
        isDeleted: false,
        createdAt: '2024-06-01T08:55:00Z',
        updatedAt: '2024-06-01T08:55:00Z',
    },

    // --- CHI TIẾT ĐƠN HÀNG 2 (ID: 2 - Tổng 120,000đ) ---
    {
        id: 3,
        orderId: 2,
        productFranchiseId: 2, // Cà phê sữa đá
        productNameSnapshot: 'Cà Phê Sữa Đá',
        priceSnapshot: 45000,
        quantity: 2,
        lineTotal: 90000,
        isDeleted: false,
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2024-06-01T10:00:00Z',
    },
    {
        id: 4,
        orderId: 2,
        productFranchiseId: 3, // Trà đào cam sả
        productNameSnapshot: 'Trà Đào Cam Sả',
        priceSnapshot: 30000,
        quantity: 1,
        lineTotal: 30000,
        isDeleted: false,
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2024-06-01T10:00:00Z',
    }
];