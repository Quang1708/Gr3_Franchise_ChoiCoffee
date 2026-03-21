import { axiosAdminClient } from "@/api";
import type { data } from "../models/franchiseRequest.model";

export const searchFranchiseService = async (data: data) => {
    try{
        const response = await axiosAdminClient.post(
            "/api/franchises/search",
             data);
        if (response){
            return response.data
        }
    } catch (error) {
        console.error("Error searching franchises:", error);
        throw error;
    }
}