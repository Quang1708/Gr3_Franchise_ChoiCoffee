import type { Category } from '@/models/category.model';

export const CATEGORY_SEED_DATA: Category[] = [
    {
        id: 1,
        code: 'CAT-COFFEE',
        name: 'Cà phê',
        description: 'Các dòng cà phê máy và cà phê pha phin truyền thống.',
        is_active: true,
        is_deleted: false,
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-01T08:00:00Z',
    },
    {
        id: 2,
        code: 'CAT-TEA',
        name: 'Trà trái cây',
        description: 'Các loại trà thanh nhiệt phối hợp cùng trái cây tươi.',
        is_active: true,
        is_deleted: false,
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-01T08:00:00Z',
    },
    {
        id: 3,
        code: 'CAT-ICE',
        name: 'Đá xay (Ice Blended)',
        description: 'Thức uống đá xay kèm kem tươi béo ngậy.',
        is_active: true,
        is_deleted: false,
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-01T08:00:00Z',
    },
    {
        id: 4,
        code: 'CAT-FOOD',
        name: 'Thức ăn nhẹ',
        description: 'Các loại bánh ngọt và bánh mì ăn kèm.',
        is_active: true,
        is_deleted: false,
        created_at: '2024-01-01T08:00:00Z',
        updated_at: '2024-01-01T08:00:00Z',
    }
];