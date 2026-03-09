import { httpClient } from "@/api";
import type { Category } from "../models/category.model";

export const getAllCategory = async (): Promise<Category[] | null> => {
    return await httpClient.get<Category[]>({
        url: '/api/categories/select',
    }); 
}