import { httpClient } from "@/api"
import type { CategoryFranchise } from "../models/category.model"

export const getCategoryFranchise = (franchiseId: string): Promise<CategoryFranchise[] | null> => {
    return httpClient.get<CategoryFranchise[], { franchiseId: string }>({
        url: `/api/clients/franchises/${franchiseId}/categories`
    });
}