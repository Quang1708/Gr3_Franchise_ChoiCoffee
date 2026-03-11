import { axiosAdminClient } from "@/api";

// customer08.service.ts
export const updateCustomerStatusService = async (
    id: string | number, 
    is_active: boolean
) => {
    // Đảm bảo id không bị undefined/null
    if (!id) throw new Error("Missing Customer ID");

    const res = await axiosAdminClient.patch(`api/customers/${String(id)}/status`, {
        is_active,
    });

    return res.data;
};