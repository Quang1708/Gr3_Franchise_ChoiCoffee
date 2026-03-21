import { addOptionService, type AddOptionRequest } from "../services/addOption.service";

export const addOption = async (data: AddOptionRequest) => {
    return await addOptionService(data);
};