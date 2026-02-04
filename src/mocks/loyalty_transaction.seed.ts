import type { LoyaltyTransaction } from '@/models/loyalty_transaction.model';

export const LOYALTY_TRANSACTION_SEED_DATA: LoyaltyTransaction[] = [
    // 1. Tích điểm từ Đơn hàng 1 (EARN)
    {
        id: 1,
        customerFranchiseId: 1, // Nguyễn Hoàng Anh tại CN Quận 1
        orderId: 1,
        type: 'EARN',
        pointChange: 85, // Giả sử tỉ lệ 1,000đ = 1 điểm
        reason: 'Tích điểm đơn hàng ORD-20240601-001',
        createdBy: 5, // Nhân viên Dương thực hiện thanh toán
        isDeleted: false,
        createdAt: '2024-06-01T09:15:00Z',
        updatedAt: '2024-06-01T09:15:00Z',
    },
    // 2. Dùng điểm để giảm giá (REDEEM) - Đơn hàng 2
    {
        id: 2,
        customerFranchiseId: 2, // Trần Thị Ngọc Lan tại CN Quận 7
        orderId: 2,
        type: 'REDEEM',
        pointChange: -50, // Trừ 50 điểm
        reason: 'Dùng điểm giảm giá cho đơn hàng ORD-20240601-002',
        createdBy: 1, // Hệ thống (Admin) tự động trừ khi đặt Online
        isDeleted: false,
        createdAt: '2024-06-01T10:05:00Z',
        updatedAt: '2024-06-01T10:05:00Z',
    },
    // 3. Quản lý tặng thêm điểm (ADJUST) nhân dịp sinh nhật
    {
        id: 3,
        customerFranchiseId: 1,
        orderId: undefined,
        type: 'ADJUST',
        pointChange: 100,
        reason: 'Tặng điểm thưởng sinh nhật khách hàng',
        createdBy: 2, // Quản lý Phúc thực hiện
        isDeleted: false,
        createdAt: '2024-06-05T08:00:00Z',
        updatedAt: '2024-06-05T08:00:00Z',
    }
];