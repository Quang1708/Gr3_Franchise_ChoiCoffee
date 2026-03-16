import { axiosAdminClient } from "@/api/axios.config";
import type {
  AdminLoginRequest,
  AdminLoginResponse,
} from "../models/api.model";

export const loginAdmin = async (
  payload: AdminLoginRequest,
): Promise<AdminLoginResponse> => {
  const { data } = await axiosAdminClient.post<AdminLoginResponse>(
    "/api/auth",
    payload,
  );
  return data;
};
