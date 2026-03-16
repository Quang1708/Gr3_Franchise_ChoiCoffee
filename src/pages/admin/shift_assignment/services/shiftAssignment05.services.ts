import { axiosAdminClient } from "@/api/axios.config";
import type { ShiftAssignmentStatusPayload } from "../models/shiftAssignment.model";

export const shiftAssignment05Service = async (
  id: string,
  payload: ShiftAssignmentStatusPayload,
) => {
  const res = await axiosAdminClient.patch(
    `/api/shift-assignments/${id}/status`,
    payload,
  );
  return res.data;
};
