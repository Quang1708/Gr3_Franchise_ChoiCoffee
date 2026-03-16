import { axiosAdminClient } from "@/api/axios.config";

export type AdminLoginRequest = {
  email: string;
  password: string;
};

export type AdminLoginResponse = {
  success: boolean;
  data: {
    user: any;
    token: string;
  } | null;
  message?: string;
};

export type AdminProfileResponse = {
  success: boolean;
  data: any | { user: any } | null;
  message?: string;
};

export const loginAdmin = async (
  payload: AdminLoginRequest,
): Promise<AdminLoginResponse> => {
  const { data } = await axiosAdminClient.post<AdminLoginResponse>(
    "/api/auth",
    payload,
  );
  return data;
};

export const getAdminProfile = async (): Promise<AdminProfileResponse> => {
  const { data } = await axiosAdminClient.get<AdminProfileResponse>("/api/auth");
  return data;
};