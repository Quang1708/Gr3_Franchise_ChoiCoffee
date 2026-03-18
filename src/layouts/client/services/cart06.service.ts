import { axiosAdminClient } from "@/api";

export const cart06Service = async (cartId: string) => {
  const response = await axiosAdminClient.get(
    `/api/carts/${cartId}/count-cart-item`
  );
  return response.data;
};