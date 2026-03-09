import { httpClient } from "@/api/httpClient.api";
import type { CategoryResponse, MenuProductRequest } from "../models/categoryFranchise02.model";

export const getCategoryFranchise = async (data: MenuProductRequest): Promise<CategoryResponse | null> => {
    return await httpClient.post<CategoryResponse, MenuProductRequest>({
        url: '/api/category-franchises/search',
        data
    });
}