import { axiosClient } from "@/api/axios.config";
import type { ChangePasswordRequest } from "@/models";

/**
 * Change Password
 * PUT /api/customer-auth/change-password
 */
export const changePassword = async (
  request: ChangePasswordRequest,
): Promise<void> => {
  await axiosClient.put("/api/customer-auth/change-password", request);
};
