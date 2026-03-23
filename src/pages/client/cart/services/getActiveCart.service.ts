import { axiosClient } from "@/api/axios.config";

export const getActiveCartByCustomer = async (customerId: string) => {
  const response = await axiosClient.get(
    `/api/carts/customer/${customerId}?status=ACTIVE`,
  );
  return response.data;
};
