import { axiosAdminClient } from "@/api";

export const changeShiftStatus = async (id: string, isActive: boolean) => {
    const response = await axiosAdminClient.patch(`/api/shifts/${id}/status`, {
        is_active: isActive,
    });
    return response.data;
}