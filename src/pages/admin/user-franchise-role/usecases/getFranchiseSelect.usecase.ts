import { franchiseService } from "@/services/franchise.service";

export const getFranchiseSelectUsecase = async () => {
  return await franchiseService.getAllSelect();
};
