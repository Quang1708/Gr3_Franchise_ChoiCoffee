import { updateQuantityOptionService, type UpdateQuantityOptionRequest } from "../services/updateQuantityOption.service";

export const updateOptionQuantity = async (data: UpdateQuantityOptionRequest) => {
    return await updateQuantityOptionService(data);
}