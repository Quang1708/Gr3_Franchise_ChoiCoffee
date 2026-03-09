import { httpClient } from "@/api";
import type { MenuData } from "../models/client03.model";

export const getMenuProducts = (franchiseId: string): Promise<MenuData | null> => {
    return httpClient.get<MenuData, { 
        franchiseId: string, 
       
    }>({
        url: `/api/clients/menu?franchiseId=${franchiseId}&categoryId=`,
    });
}