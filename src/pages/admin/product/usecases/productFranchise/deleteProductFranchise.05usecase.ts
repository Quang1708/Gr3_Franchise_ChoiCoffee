import { deleteProductFranchiseService } from "../../services/productFranchise/productFranchise05.service";

export const deleteProductFranchiseUsecase = async (id: string | number) => {
    return await deleteProductFranchiseService(id);
};