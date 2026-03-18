import type { ShiftAssignmentCreatePayload } from "../models/shiftAssignment.model";
import { shiftAssignment01Service } from "../services";

export const createShiftAssignment = async (
  payload: ShiftAssignmentCreatePayload,
) => {
  return await shiftAssignment01Service(payload);
};
