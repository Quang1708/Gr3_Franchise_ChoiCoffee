import type { ShiftAssignmentItem } from "../models/shiftAssignment.model";
import { shiftAssignment04Service, shiftGetByIdService } from "../services";
import {
  extractItem,
  mergeShiftAssignmentItem,
  getAssignedByDisplayName,
} from "../utils/shiftAssignment.helpers";
import { userApi } from "@/api/user/user.api";

export const getShiftAssignmentById = async (
  item: ShiftAssignmentItem,
): Promise<ShiftAssignmentItem> => {
  const res = await shiftAssignment04Service(item.id);
  const base = mergeShiftAssignmentItem(item, extractItem(res));

  // Fetch shift times if missing
  if ((!base.start_time || !base.end_time) && base.shift_id) {
    try {
      const r = (await shiftGetByIdService(base.shift_id)) as Record<
        string,
        unknown
      >;
      const d = (r?.data ?? r) as Record<string, unknown>;
      if (!base.start_time) {
        base.start_time = String(d?.startTime ?? d?.start_time ?? "");
      }
      if (!base.end_time) {
        base.end_time = String(d?.endTime ?? d?.end_time ?? "");
      }
    } catch {
      /* ignore */
    }
  }

  // Fetch assigned_by name if missing
  if (base.assigned_by && !base.assigned_by_name) {
    try {
      const response = (await userApi.getById(base.assigned_by)) as Record<
        string,
        unknown
      >;
      base.assigned_by_name = getAssignedByDisplayName(
        response,
        base.assigned_by,
      );
    } catch {
      /* ignore */
    }
  }

  return base;
};
