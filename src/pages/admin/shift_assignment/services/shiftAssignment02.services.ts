import { axiosAdminClient } from "@/api/axios.config";
import type { ShiftAssignmentBulkPayload } from "../models/shiftAssignment.model";

export const shiftAssignment02Service = async (
  payload: ShiftAssignmentBulkPayload,
) => {
  const res = await axiosAdminClient.post(
    "/api/shift-assignments/bulk",
    payload,
  );
  return res.data;
};
