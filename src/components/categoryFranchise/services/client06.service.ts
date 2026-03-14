import { httpClient } from "@/api";
import type { Franchise } from "../models/client06.model";

export const getFranchiseName = async (franchiseId: string): Promise<Franchise | null> => {
    return await httpClient.get<Franchise>({
        url: `/api/clients/franchises/${franchiseId}`,
    })
};