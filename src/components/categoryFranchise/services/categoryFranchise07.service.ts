import { httpClient } from "@/api"
import type { DisplayOrderResponse } from "../models/categoryFranchise07.model"

export const updateDisplayOrder = async (id: string,  display_order: number ): Promise<DisplayOrderResponse | null> => {
    return await httpClient.patch<DisplayOrderResponse>({
        url: `/api/category-franchises/${id}/display-order`,
        data: { display_order },
    })
}