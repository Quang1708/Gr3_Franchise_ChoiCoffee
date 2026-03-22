import { restoreProductFranchiseService } from "../../services/productFranchise/productFranchise06.service";

export const restoreProductFranchiseUsecase = async (id: string | number) => {
    return await restoreProductFranchiseService(id);
};