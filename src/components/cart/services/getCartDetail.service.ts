import { axiosAdminClient } from "@/api";

export const getCartDetailService = async (cartId: string) => {
  try {
    const reponse = await axiosAdminClient.get(
        `/api/carts/${cartId}`
    );
    if (reponse.data.success) {
      return reponse.data;
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết giỏ hàng:", error);
    throw error;
  }
};
