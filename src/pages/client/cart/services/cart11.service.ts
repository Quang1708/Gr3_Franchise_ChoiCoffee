import { axiosClient } from "@/api/axios.config";

export const applyVoucherCart11Service = async (
  cartId: string,
  voucherCode: string,
) => {
  const response = await axiosClient.put(`/api/carts/${cartId}/apply-voucher`, {
    voucher_code: voucherCode,
  });

  return response.data;
};
