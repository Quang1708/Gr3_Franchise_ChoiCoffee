import { changeStatusProductFranchiseService } from "../../services/productFranchise/productFranchise07.service";

export const changeStatusProductFranchiseUsecase = async (
    id: string | number,
    is_active: boolean
) => {
    return await changeStatusProductFranchiseService(id, is_active);
};