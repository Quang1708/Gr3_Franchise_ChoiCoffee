import { deleteShift } from "../services/shift05.service";

export const deleteShiftById = async (id: string) => {
    try {
        const response = await deleteShift(id);
        if (response) {
            return response.data;
        }   
    } catch (error) {
        console.error("Error deleting shift:", error);
        throw error;
    }
};