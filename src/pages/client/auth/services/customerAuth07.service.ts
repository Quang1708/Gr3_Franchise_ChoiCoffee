import { axiosClient } from "@/api/axios.config";
import type { VerifyTokenRequest } from "../models/auth.model";

/*
 * Verify Token
 * POST /api/customer-auth/verify-token
 */
export const verifyToken = async (
  request: VerifyTokenRequest,
): Promise<void> => {
  await axiosClient.post("/api/customer-auth/verify-token", request);
};
