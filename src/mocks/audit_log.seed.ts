import type { AuditLog } from '@/models/audit_log.model';

export const AUDIT_LOG_SEED_DATA: AuditLog[] = [
    // 1. Cập nhật giá sản phẩm (Admin thực hiện)
    {
        id: 1,
        entityType: 'product_franchise',
        entityId: 1, // ID bản ghi giá của Cafe Đen tại CN1
        action: 'UPDATE',
        oldData: { priceBase: 32000, updatedAt: '2024-01-01T08:00:00Z' },
        newData: { priceBase: 35000, updatedAt: '2024-06-01T10:00:00Z' },
        changedBy: 1, // Trân (Admin)
        note: 'Điều chỉnh giá theo giá thị trường mới',
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2024-06-01T10:00:00Z',
    },
    // 2. Xóa nhân viên (Manager thực hiện)
    {
        id: 2,
        entityType: 'user',
        entityId: 9, // Nhân viên 9
        action: 'SOFT_DELETE',
        oldData: { isDeleted: false },
        newData: { isDeleted: true },
        changedBy: 2, // Phúc (Manager)
        note: 'Nhân viên nghỉ việc theo nguyện vọng',
        createdAt: '2024-06-05T17:30:00Z',
        updatedAt: '2024-06-05T17:30:00Z',
    },
    // 3. Tạo mới một chi nhánh (Admin thực hiện)
    {
        id: 3,
        entityType: 'franchise',
        entityId: 4, // Chi nhánh mới ID 4
        action: 'CREATE',
        oldData: null,
        newData: { code: 'FR-HCM-003', name: 'Chi nhánh Quận 3', address: '...'},
        changedBy: 1,
        note: 'Mở rộng chi nhánh mới tại khu vực trung tâm',
        createdAt: '2024-06-10T08:00:00Z',
        updatedAt: '2024-06-10T08:00:00Z',
    }
];