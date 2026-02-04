import type { ShiftAssignment } from '@/models/shift_assignment.model';

export const SHIFT_ASSIGNMENT_SEED_DATA: ShiftAssignment[] = [
    // --- NGÀY 2024-06-01 tại Chi nhánh Quận 1 ---
    {
        id: 1,
        shiftId: 1, // Ca Sáng (CN1)
        userId: 5,  // Dương
        workDate: '2024-06-01',
        assignedBy: 2, // Phúc (Manager)
        status: 'COMPLETED',
        isDeleted: false,
        createdAt: '2024-05-30T10:00:00Z',
        updatedAt: '2024-06-01T12:00:00Z',
    },
    {
        id: 2,
        shiftId: 2, // Ca Chiều (CN1)
        userId: 6,  // Tín
        workDate: '2024-06-01',
        assignedBy: 2,
        status: 'COMPLETED',
        isDeleted: false,
        createdAt: '2024-05-30T10:00:00Z',
        updatedAt: '2024-06-01T17:00:00Z',
    },
    {
        id: 3,
        shiftId: 3, // Ca Tối (CN1)
        userId: 5,  // Dương (Làm thêm ca tối)
        workDate: '2024-06-01',
        assignedBy: 2,
        status: 'ABSENT', // Giả sử Dương vắng mặt ca này để bạn test logic
        isDeleted: false,
        createdAt: '2024-05-30T10:00:00Z',
        updatedAt: '2024-06-01T18:00:00Z',
    },

    // --- NGÀY 2024-06-02 ---
    {
        id: 4,
        shiftId: 1, // Ca Sáng (CN1)
        userId: 6,  // Tín
        workDate: '2024-06-02',
        assignedBy: 2,
        status: 'ASSIGNED', // Đang trong lịch trình
        isDeleted: false,
        createdAt: '2024-05-30T10:00:00Z',
        updatedAt: '2024-05-30T10:00:00Z',
    }
];