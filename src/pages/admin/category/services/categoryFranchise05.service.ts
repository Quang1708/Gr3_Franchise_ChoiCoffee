import { httpClient } from "@/api"

export const restoreCategoryFranchise = async (id: string): Promise<void | null> => {
    return await httpClient.patch<void>({
        url: `/api/category-franchises/${id}/restore`,
    });
}