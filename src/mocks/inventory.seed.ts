import type { Inventory } from '@/models/inventory.model';

export const INVENTORY_SEED_DATA: Inventory[] = [
    // --- KHO CHI NHÁNH 1 (Dựa trên productFranchiseId 1-5 đã tạo trước đó) ---
    {
        id: 1,
        productFranchiseId: 1, // Cà phê đen đá - CN Quận 1
        quantity: 100,
        alertThreshold: 10,
        isActive: true,
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 2,
        productFranchiseId: 2, // Cà phê sữa đá - CN Quận 1
        quantity: 85,
        alertThreshold: 10,
        isActive: true,
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 3,
        productFranchiseId: 3, // Trà đào cam sả - CN Quận 1
        quantity: 5, // Sắp hết hàng
        alertThreshold: 10,
        isActive: true,
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 4,
        productFranchiseId: 4, // Matcha đá xay - CN Quận 1
        quantity: 0, // Hết hàng
        alertThreshold: 5,
        isActive: false, // Chuyển sang false để POS/App báo OUT_OF_STOCK
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    },
    {
        id: 5,
        productFranchiseId: 5, // Tiramisu - CN Quận 1
        quantity: 20,
        alertThreshold: 5,
        isActive: true,
        isDeleted: false,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
    }
];