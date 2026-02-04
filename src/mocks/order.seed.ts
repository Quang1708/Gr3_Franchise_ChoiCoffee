import type { Order } from '@/models/order.model';

export const ORDER_SEED_DATA: Order[] = [
    // Đơn hàng 1: Đã hoàn tất, mua tại quầy (POS)
    {
        id: 1,
        code: 'ORD-20240601-001',
        franchiseId: 1,
        customerId: 1, // Khách hàng: Nguyễn Hoàng Anh
        type: 'POS',
        status: 'COMPLETED',
        totalAmount: 85000,
        confirmedAt: '2024-06-01T09:00:00Z',
        completedAt: '2024-06-01T09:15:00Z',
        createdBy: 5, // Nhân viên: Dương
        isDeleted: false,
        createdAt: '2024-06-01T08:55:00Z',
        updatedAt: '2024-06-01T09:15:00Z',
    },
    // Đơn hàng 2: Đang chuẩn bị, đặt qua App (ONLINE)
    {
        id: 2,
        code: 'ORD-20240601-002',
        franchiseId: 1,
        customerId: 2, // Khách hàng: Trần Thị Ngọc Lan
        type: 'ONLINE',
        status: 'PREPARING',
        totalAmount: 120000,
        confirmedAt: '2024-06-01T10:05:00Z',
        createdBy: undefined, // Đơn online thường không có staff tạo trực tiếp ban đầu
        isDeleted: false,
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2024-06-01T10:05:00Z',
    },
    // Đơn hàng 3: Đã bị hủy
    {
        id: 3,
        code: 'ORD-20240601-003',
        franchiseId: 1,
        customerId: 3,
        type: 'POS',
        status: 'CANCELLED',
        totalAmount: 45000,
        cancelledAt: '2024-06-01T11:20:00Z',
        createdBy: 6, // Nhân viên: Tín
        isDeleted: false,
        createdAt: '2024-06-01T11:00:00Z',
        updatedAt: '2024-06-01T11:20:00Z',
    }
];