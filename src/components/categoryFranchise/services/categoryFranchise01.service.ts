import { httpClient } from "@/api";
import type { PostCategoryFranchiseResponse } from "../models/categoryFranchise01.model";

export const postCategoryFranchise = async (categoryId: string, franchiseId: string, display_order?: number): Promise<PostCategoryFranchiseResponse | null> => {
    return await httpClient.post<PostCategoryFranchiseResponse>({
        url: `/api/category-franchises`,
        data: {
            category_id: categoryId,
            franchise_id: franchiseId,
            display_order: display_order,
        }
    });
}