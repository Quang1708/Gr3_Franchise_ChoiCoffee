import { axiosAdminClient } from "@/api/axios.config";
import type { ShiftAssignmentCreatePayload } from "../models/shiftAssignment.model";

export const shiftAssignment01Service = async (
  payload: ShiftAssignmentCreatePayload,
) => {
  const res = await axiosAdminClient.post("/api/shift-assignments", payload);
  return res.data;
};
