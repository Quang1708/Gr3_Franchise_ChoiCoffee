import type { ShiftAssignmentStatus } from "../models/shiftAssignment.model";
import { shiftAssignment05Service } from "../services";

export const updateShiftAssignmentStatus = async (
  id: string,
  status: ShiftAssignmentStatus,
) => {
  return await shiftAssignment05Service(id, { status });
};
