import { axiosClient } from "@/api/axios.config";
import type { CustomerProfile, CustomerProfileResponse } from "@/models";

/**
 * Get Customer Profile
 * GET /api/customer-auth
 */
export const getCustomerProfile = async (): Promise<CustomerProfile> => {
  const { data } =
    await axiosClient.get<CustomerProfileResponse>("/api/customer-auth");
  return data.data;
};
