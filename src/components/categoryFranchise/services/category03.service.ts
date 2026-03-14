import { httpClient } from "@/api";
import type { GetCategoryByIdResponse } from "../models/category03.model";

export const getCategoryById = async (categoryId: string): Promise<GetCategoryByIdResponse | null> => {
    return await httpClient.get<GetCategoryByIdResponse>({
        url: `/api/categories/${categoryId}`,
    });
}