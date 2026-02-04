export interface ShiftAssignment {
    id: number;
    shiftId: number;
    userId: number;
    workDate: string; // Định dạng "YYYY-MM-DD"
    assignedBy: number; // ID của Manager tạo lịch
    status: 'ASSIGNED' | 'COMPLETED' | 'ABSENT';
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}