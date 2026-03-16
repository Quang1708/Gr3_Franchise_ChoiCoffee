import { restoreShift } from "../services/shift06.service";

export const restoreShiftById = async (id: string) => {
    try {
        const response = await restoreShift(id);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error("Error restoring shift:", error);
        throw error;
    }
};