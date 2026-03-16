import { axiosAdminClient } from "@/api";

export const getSelectShift = async (id: number) => {
    const response = await axiosAdminClient.get(
        `/api/shifts/${id}`
    );
    return response.data;
}