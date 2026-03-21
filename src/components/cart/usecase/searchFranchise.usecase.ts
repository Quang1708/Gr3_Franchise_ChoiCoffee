import type { data } from "../models/franchiseRequest.model";
import { searchFranchiseService } from "../services/franchise.service";

export const searchFranchsie = async (data: data) => {
    return await searchFranchiseService(data);
}