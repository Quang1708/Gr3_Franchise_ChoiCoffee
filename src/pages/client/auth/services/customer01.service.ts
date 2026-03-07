import { axiosClient } from "@/api/axios.config";
import type { RegisterRequest, RegisterResponse } from "../models/auth.model";

/*
 * Customer Registration
 * POST /api/customers/register
 */
export const customerRegister = async (
  userData: RegisterRequest,
): Promise<RegisterResponse> => {
  const { data } = await axiosClient.post<RegisterResponse>(
    "/api/customers/register",
    userData,
  );
  return data;
};
