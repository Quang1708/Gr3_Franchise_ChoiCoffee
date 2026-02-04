import type { Role } from '@/models/role.model'

export const ROLE_SEED_DATA: Role[] = [
    {
        id: 1,
        code: 'ADMIN',
        name: 'Hệ thống / Quản trị viên',
        description: 'Toàn quyền quản trị hệ thống, quản lý danh mục sản phẩm và tất cả các chi nhánh.',
        scope: 'GLOBAL',
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 2,
        code: 'MANAGER',
        name: 'Quản lý chi nhánh',
        description: 'Quản lý nhân sự, kho hàng, phê duyệt ca làm việc và xem báo cáo tại chi nhánh được gán.',
        scope: 'FRANCHISE',
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 3,
        code: 'STAFF',
        name: 'Nhân viên bán hàng',
        description: 'Thực hiện tạo đơn hàng (POS), thanh toán, kiểm tra tồn kho và phục vụ khách hàng.',
        scope: 'FRANCHISE',
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
];