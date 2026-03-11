import { axiosAdminClient } from "@/api";

export const deleteCustomerService = async (id: string | number) => {
    const res = await axiosAdminClient.delete(`/api/customers/${id}`);
    return res.data;
};