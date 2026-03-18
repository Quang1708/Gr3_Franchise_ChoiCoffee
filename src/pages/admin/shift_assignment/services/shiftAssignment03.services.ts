import { axiosAdminClient } from "@/api/axios.config";
import type { ShiftAssignmentSearchPayload } from "../models/shiftAssignment.model";

export const shiftAssignment03Service = async (
  payload: ShiftAssignmentSearchPayload,
) => {
  const res = await axiosAdminClient.post(
    "/api/shift-assignments/search",
    payload,
  );
  return res.data;
};
