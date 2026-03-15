import type { CategoryResponse, MenuProductRequest } from "../models/categoryFranchise02.model";
import { axiosAdminClient } from "@/api";

export const getCategoryFranchise = async (data: MenuProductRequest) => {
    const response = await axiosAdminClient.post<CategoryResponse>(
       '/api/category-franchises/search',
        data
    );
    return response.data;
}