import { axiosClient } from "@/api/axios.config";
import type { UpdateCustomerProfileRequest } from "@/models";

/**
 * Update Customer Profile
 * PUT /api/customers/:id
 */
export const updateCustomerProfile = async (
  customerId: string,
  request: UpdateCustomerProfileRequest,
): Promise<void> => {
  await axiosClient.put(`/api/customers/${customerId}`, request);
};
