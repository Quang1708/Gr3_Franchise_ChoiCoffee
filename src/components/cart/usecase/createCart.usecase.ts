import type { CreateCartRequest } from "../models/createCart.model";
import { addCartService } from "../services/addCart.service";

export const createCart = async (data: CreateCartRequest) => {
    return await addCartService(data);
}