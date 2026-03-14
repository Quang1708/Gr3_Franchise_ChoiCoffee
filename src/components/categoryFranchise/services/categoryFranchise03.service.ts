import { httpClient } from "@/api";
import type { CategoryFranchise } from "../models/categotyFranchise03.model";

export const getCategoryFranchiseById = async (id: string): Promise<CategoryFranchise | null> => {
    return await httpClient.get<CategoryFranchise>({
        url: `/api/category-franchises/${id}`,
    });
}