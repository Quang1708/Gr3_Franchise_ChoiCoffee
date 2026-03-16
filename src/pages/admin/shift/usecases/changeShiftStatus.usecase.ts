import { changeShiftStatus } from "../services/shift07.service";

export const changeShiftStatusById = async (id: string, isActive: boolean) => {
    try {
        const response = await changeShiftStatus(id, isActive);
        if (response) {
            return response.data;
        }
    } catch (error) {
        console.error("Error changing shift status:", error);
        throw error;
    }
}