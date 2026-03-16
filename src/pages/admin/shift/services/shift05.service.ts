import { axiosAdminClient } from "@/api";

export const deleteShift = async (id: string) => {
    return await axiosAdminClient.delete(`/api/shifts/${id}`);
}