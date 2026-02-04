import type { Shift } from "../../models/new_models/shift.model";

export const MOCK_SHIFTS: Shift[] = [
  {
    id: 1,
    franchiseId: 1,
    name: "Morning Shift",
    startTime: "07:00:00",
    endTime: "15:00:00",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    franchiseId: 1,
    name: "Evening Shift",
    startTime: "15:00:00",
    endTime: "23:00:00",
    isActive: true,
    isDeleted: false,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const MOCK_SHIFT_ASSIGNMENTS: import("../../models/new_models/shift.model").ShiftAssignment[] =
  [
    {
      id: 1,
      shiftId: 1,
      userId: 3, // Staff Central
      workDate: "2023-01-10",
      assignedBy: 2, // Manager
      status: "ASSIGNED",
      isDeleted: false,
      createdAt: "2023-01-09T10:00:00Z",
      updatedAt: "2023-01-09T10:00:00Z",
    },
  ];
