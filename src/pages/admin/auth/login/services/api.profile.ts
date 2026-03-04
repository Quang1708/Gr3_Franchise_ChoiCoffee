/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosAdminClient } from "@/api/axios.config";

export type AdminUser = {
  id: string;
  email: string;
  phone: string;
  name: string;
  avatar_url: string;
};

export type AdminRole = {
  role: string;
  scope: string;
  franchise_id: string;
  franchise_name: string;
};

export type ActiveContext = {
  role: string;
  scope: string;
  franchiseid: string;
};

export type AdminProfileResponse = {
  success: boolean;
  data: {
    user: AdminUser;
    roles: AdminRole[];
    active_context: ActiveContext;
  } | null;
  message?: string;
};

export const getAdminProfile = async (): Promise<AdminProfileResponse> => {
  const { data } = await axiosAdminClient.get<AdminProfileResponse>(
    "/api/auth",
  );
  return data;
};