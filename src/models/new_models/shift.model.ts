export interface Shift {
  id: number;
  franchiseId: number;
  name: string; // Morning / Evening
  startTime: string; // Time string
  endTime: string; // Time string
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ShiftAssignmentStatus = "ASSIGNED" | "COMPLETED" | "ABSENT";

export interface ShiftAssignment {
  id: number;
  shiftId: number;
  userId: number;
  workDate: string; // Date string YYYY-MM-DD
  assignedBy: number;
  status: ShiftAssignmentStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
