import { getSelectShift } from "../services/shift03.service";

export const getShiftById = async (id: number) => {
    return await getSelectShift(id);
}