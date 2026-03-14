import { httpClient } from "@/api";
import type { Franchise } from "../models/franchise08.model";

export const getAllFranchises = async (): Promise<Franchise[] | null> => {
    return await httpClient.get<Franchise[]>({
        url: '/api/franchises/select',
    });
};