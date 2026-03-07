import { axiosClient } from "@/api/axios.config";
import type { LoginRequest, LoginResponse } from "../models/auth.model";

/*
 * Customer Login
 * POST /api/customer-auth
 */
export const customerLogin = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<LoginResponse>(
    "/api/customer-auth",
    credentials,
  );
  return data;
};
