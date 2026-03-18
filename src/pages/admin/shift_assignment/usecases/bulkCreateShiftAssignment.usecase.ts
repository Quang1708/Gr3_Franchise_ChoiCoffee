import type { ShiftAssignmentBulkRow } from "../models/shiftAssignment.model";
import { shiftAssignment02Service } from "../services";

export const bulkCreateShiftAssignment = async (
  items: ShiftAssignmentBulkRow[],
) => {
  return await shiftAssignment02Service({ items });
};
