import type { SearchShiftRequest } from "../models/ShiftRequest02.model";
import { getAllShifts } from "../services/shift01.service";

export const searchShift = async (data: SearchShiftRequest) => {
    return await getAllShifts(data);
}