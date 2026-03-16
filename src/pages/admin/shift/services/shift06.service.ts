import { axiosAdminClient } from "@/api"

export const restoreShift = async (id: string) => {
    return await axiosAdminClient.patch(`/api/shifts/${id}/restore`) 
}