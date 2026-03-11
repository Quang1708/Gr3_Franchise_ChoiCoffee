import { httpClient } from "@/api";

export const updateStatusCategoryFranchsie = async (id: string, is_active: boolean): Promise<void> => {
    await httpClient.patch({
        url: `/api/category-franchises/${id}/status`,
        data: { is_active },
    });
}