import type { CustomerFranchise } from '@/models/customer_franchise.model';

export const CUSTOMER_FRANCHISE_SEED_DATA: CustomerFranchise[] = [
    // Khách 1: Nguyễn Hoàng Anh - Thân thiết tại Chi nhánh Quận 1
    {
        id: 1,
        customerId: 1,
        franchiseId: 1,
        loyaltyPoint: 1250,
        loyaltyTier: 'Platinum',
        firstOrderAt: '2024-02-01T10:00:00Z',
        lastOrderAt: '2024-05-15T15:30:00Z',
        isActive: true,
        isDeleted: false,
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-05-15T15:30:00Z',
    },
    // Khách 2: Trần Thị Ngọc Lan - Khách mới tại Chi nhánh Quận 7
    {
        id: 2,
        customerId: 2,
        franchiseId: 2,
        loyaltyPoint: 150,
        loyaltyTier: 'Silver',
        firstOrderAt: '2024-03-10T11:00:00Z',
        lastOrderAt: '2024-04-12T09:00:00Z',
        isActive: true,
        isDeleted: false,
        createdAt: '2024-03-10T11:00:00Z',
        updatedAt: '2024-04-12T09:00:00Z',
    },
    // Khách 3: Lê Quang Minh - Khách quen tại Chi nhánh Hà Nội
    {
        id: 3,
        customerId: 3,
        franchiseId: 3,
        loyaltyPoint: 600,
        loyaltyTier: 'Gold',
        firstOrderAt: '2024-01-20T08:00:00Z',
        lastOrderAt: '2024-05-20T19:45:00Z',
        isActive: true,
        isDeleted: false,
        createdAt: '2024-01-20T08:00:00Z',
        updatedAt: '2024-05-20T19:45:00Z',
    },
    // Khách 1 (Nguyễn Hoàng Anh) cũng có ghé Chi nhánh Hà Nội khi đi công tác
    {
        id: 4,
        customerId: 1,
        franchiseId: 3,
        loyaltyPoint: 50,
        loyaltyTier: 'Silver',
        firstOrderAt: '2024-04-01T14:00:00Z',
        lastOrderAt: '2024-04-01T14:00:00Z',
        isActive: true,
        isDeleted: false,
        createdAt: '2024-04-01T14:00:00Z',
        updatedAt: '2024-04-01T14:00:00Z',
    }
];