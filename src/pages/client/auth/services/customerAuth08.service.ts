import { axiosClient } from "@/api/axios.config";
import type { ResendTokenRequest } from "../models/auth.model";

/*
 * Resend Token
 * POST /api/customer-auth/resend-token
 */
export const resendToken = async (
  request: ResendTokenRequest,
): Promise<void> => {
  await axiosClient.post("/api/customer-auth/resend-token", request);
};
