import { axiosClient } from "@/api/axios.config";
import type { ForgotPasswordRequest } from "../models/auth.model";

/*
 * Forgot Password
 * PUT /api/customer-auth/forgot-password
 */
export const forgotPassword = async (
  request: ForgotPasswordRequest,
): Promise<void> => {
  await axiosClient.put("/api/customer-auth/forgot-password", request);
};
