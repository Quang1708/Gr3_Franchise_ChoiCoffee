import { axiosClient } from "@/api/axios.config";

export const removeVoucherCart12Service = async (cartId: string) => {
  const response = await axiosClient.delete(
    `/api/carts/${cartId}/remove-voucher`,
  );

  return response.data;
};
