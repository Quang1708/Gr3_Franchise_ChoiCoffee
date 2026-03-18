import { axiosAdminClient } from "@/api";
import type { AddCartRequest } from "../models/addCart.model";

export const addItemToCart = async (cartData: AddCartRequest) => {
    const response = await axiosAdminClient.post(
        "/api/carts/items",
        cartData
    );
    return response.data;
};