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
    },
    {
        id: 4,
        customerFranchiseId: 3,
        orderId: undefined,
        type: 'EARN',
        pointChange: 120,
        reason: 'Tích điểm đơn hàng tại quầy',
        createdBy: 6,
        isDeleted: false,
        createdAt: '2024-06-10T14:20:00Z',
        updatedAt: '2024-06-10T14:20:00Z',
    },
    {
        id: 5,
        customerFranchiseId: 3,
        orderId: undefined,
        type: 'REDEEM',
        pointChange: -200,
        reason: 'Đổi quà miễn phí cà phê',
        createdBy: 4,
        isDeleted: false,
        createdAt: '2024-06-12T11:00:00Z',
        updatedAt: '2024-06-12T11:00:00Z',
    },
    {
        id: 6,
        customerFranchiseId: 4,
        orderId: undefined,
        type: 'EARN',
        pointChange: 35,
        reason: 'Tích điểm lần đầu ghé chi nhánh Hà Nội',
        createdBy: 7,
        isDeleted: false,
        createdAt: '2024-04-01T14:30:00Z',
        updatedAt: '2024-04-01T14:30:00Z',
    },
    {
        id: 7,
        customerFranchiseId: 1,
        orderId: undefined,
        type: 'ADJUST',
        pointChange: -20,
        reason: 'Điều chỉnh sai sót tích điểm',
        createdBy: 2,
        isDeleted: false,
        createdAt: '2024-06-08T09:00:00Z',
        updatedAt: '2024-06-08T09:00:00Z',
    },
    {
        id: 8,
        customerFranchiseId: 2,
        orderId: undefined,
        type: 'EARN',
        pointChange: 65,
        reason: 'Tích điểm đơn hàng online',
        createdBy: 1,
        isDeleted: false,
        createdAt: '2024-05-20T16:45:00Z',
        updatedAt: '2024-05-20T16:45:00Z',
    },
];