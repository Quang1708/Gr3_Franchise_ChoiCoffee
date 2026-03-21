import { axiosAdminClient } from "@/api"

export const getCartByCustomer = async (customerId: string, status?: string) => {
    try{
        const response = await axiosAdminClient.get(
            `/api/carts/customer/${customerId}?status=${status || "ACTIVE"}`
        )
        if (response){
            return response.data
        }
    } catch (error) {
        console.error("Error fetching cart by customer:", error)
        throw error
    }
}