import { axiosAdminClient } from "@/api"

export const cart03Service = async(id: string) => {
    const response = await axiosAdminClient.get(
        `/api/carts/customer/${id}?status=ACTIVE`
    );
    return response.data;
}