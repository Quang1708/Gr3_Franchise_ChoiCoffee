import type { Franchise } from '@/models/franchise.model';

export const FRANCHISE_SEED_DATA: Franchise[] = [
    {
        id: 1,
        code: 'FR-HCM-001',
        name: 'Chi nhánh Quận 1 - Nguyễn Huệ',
        logoUrl: 'https://cdn.example.com/logos/hcm-q1.png',
        address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
        openedAt: '2023-01-15T08:00:00Z',
        isActive: true,
        isDeleted: false,
        createdAt: '2023-01-01T10:00:00Z',
        updatedAt: '2023-01-01T10:00:00Z',
    },
    {
        id: 2,
        code: 'FR-HCM-002',
        name: 'Chi nhánh Quận 7 - Phú Mỹ Hưng',
        logoUrl: 'https://cdn.example.com/logos/hcm-q7.png',
        address: '456 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh',
        openedAt: '2023-06-20T08:00:00Z',
        isActive: true,
        isDeleted: false,
        createdAt: '2023-06-01T10:00:00Z',
        updatedAt: '2023-06-01T10:00:00Z',
    },
    {
        id: 3,
        code: 'FR-HN-001',
        name: 'Chi nhánh Hoàn Kiếm - Tràng Tiền',
        logoUrl: 'https://cdn.example.com/logos/hn-hk.png',
        address: '78 Tràng Tiền, Quận Hoàn Kiếm, Hà Nội',
        openedAt: '2023-12-01T08:00:00Z',
        isActive: true,
        isDeleted: false,
        createdAt: '2023-11-20T10:00:00Z',
        updatedAt: '2023-11-20T10:00:00Z',
    }
];