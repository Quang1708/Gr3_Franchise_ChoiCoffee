import { httpClient } from "@/api";

export const deleteCategoryFranchise = async (id: string): Promise<void | null> => {
    return await httpClient.delete<void>({
        url: `/api/category-franchises/${id}`,
    });
};