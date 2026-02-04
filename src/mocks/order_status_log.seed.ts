import type { OrderStatusLog } from '@/models/order_status_log.model';

export const ORDER_STATUS_LOG_SEED_DATA: OrderStatusLog[] = [
    // 1. Chuyển từ Nháp sang Xác nhận đơn
    {
        id: 1,
        orderId: 1,
        fromStatus: 'DRAFT',
        toStatus: 'CONFIRMED',
        changedBy: 5, // Nhân viên Dương xác nhận tại quầy
        note: 'Khách hàng thanh toán tiền mặt',
        createdAt: '2024-06-01T09:00:00Z',
        updatedAt: '2024-06-01T09:00:00Z',
    },
    // 2. Chuyển từ Xác nhận sang Đang chuẩn bị (Barista bắt đầu làm món)
    {
        id: 2,
        orderId: 1,
        fromStatus: 'CONFIRMED',
        toStatus: 'PREPARING',
        changedBy: 5,
        note: 'Đã gửi đơn xuống quầy bar',
        createdAt: '2024-06-01T09:02:00Z',
        updatedAt: '2024-06-01T09:02:00Z',
    },
    // 3. Chuyển sang Hoàn tất (Giao món cho khách)
    {
        id: 3,
        orderId: 1,
        fromStatus: 'PREPARING',
        toStatus: 'COMPLETED',
        changedBy: 5,
        note: 'Khách đã nhận đủ món',
        createdAt: '2024-06-01T09:15:00Z',
        updatedAt: '2024-06-01T09:15:00Z',
    },

    // --- LOG CHO ĐƠN HÀNG 3 (ĐƠN BỊ HỦY) ---
    {
        id: 4,
        orderId: 3,
        fromStatus: 'CONFIRMED',
        toStatus: 'CANCELLED',
        changedBy: 6, // Nhân viên Tín hủy đơn
        note: 'Khách đổi ý không mua nữa',
        createdAt: '2024-06-01T11:20:00Z',
        updatedAt: '2024-06-01T11:20:00Z',
    }
];