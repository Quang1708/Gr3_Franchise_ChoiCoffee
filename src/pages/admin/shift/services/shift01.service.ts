import { axiosAdminClient } from "@/api";
import type { SearchShiftRequest } from "../models/ShiftRequest02.model";

export const getAllShifts = async (data: SearchShiftRequest) => {
    const response = await axiosAdminClient.post(
        "/api/shifts/search",
        data
    );
    return response.data;
}