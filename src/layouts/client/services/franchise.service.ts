import { httpClient } from "@/api";
import type { Franchise } from "../models/franchise.model";


export const getAllFranchise = (): Promise<Franchise[] | null> => {
  return httpClient.get<Franchise[]>({
    url: "/api/clients/franchises",
  });
};

// export const getFranchise = ()