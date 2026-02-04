import type { Shift } from '@/models/shift.model';

export const SHIFT_SEED_DATA: Shift[] = [
  // --- CHI NHÁNH 1 (QUẬN 1) ---
  {
    id: 1,
    franchiseId: 1,
    name: 'Ca Sáng',
    startTime: '07:00:00',
    endTime: '12:00:00',
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 2,
    franchiseId: 1,
    name: 'Ca Chiều',
    startTime: '12:00:00',
    endTime: '17:00:00',
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 3,
    franchiseId: 1,
    name: 'Ca Tối',
    startTime: '17:00:00',
    endTime: '23:00:00', // Quận 1 đóng cửa muộn
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },

  // --- CHI NHÁNH 2 (QUẬN 7) ---
  {
    id: 4,
    franchiseId: 2,
    name: 'Ca Sáng',
    startTime: '07:30:00',
    endTime: '12:30:00',
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 5,
    franchiseId: 2,
    name: 'Ca Chiều',
    startTime: '12:30:00',
    endTime: '21:30:00', // Ca gãy hoặc ca dài
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },

  // --- CHI NHÁNH 3 (HÀ NỘI) ---
  {
    id: 6,
    franchiseId: 3,
    name: 'Ca Sáng',
    startTime: '07:00:00',
    endTime: '15:00:00', // Full-time morning
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 7,
    franchiseId: 3,
    name: 'Ca Chiều Tối',
    startTime: '15:00:00',
    endTime: '22:30:00',
    isActive: true,
    isDeleted: false,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
  }
];