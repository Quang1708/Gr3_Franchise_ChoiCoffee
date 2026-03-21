import { axiosAdminClient } from "@/api";
import type { CreateCartRequest } from "../models/createCart.model";

export const addCartService = async (data: CreateCartRequest) => {
    try{
        const response = await axiosAdminClient.post(
            "/api/carts/items/staff-bulk",
            data);
        if (response){
            return response.data
        }
    } catch (error) {
        console.error("Error adding cart:", error);
        throw error;
    }
}