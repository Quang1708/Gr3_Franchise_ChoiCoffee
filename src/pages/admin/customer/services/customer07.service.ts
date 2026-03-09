import { axiosAdminClient } from "@/api";

export const restoreCustomerService = async (id: string | number) => {
    const res = await axiosAdminClient.patch(`/api/customers/${id}/restore`);
    return res.data;
};