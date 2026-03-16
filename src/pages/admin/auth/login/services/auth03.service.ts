import { axiosAdminClient } from "@/api/axios.config";
import type { AdminProfileResponse } from "../models/api.model";

export const getAdminProfile = async (): Promise<AdminProfileResponse> => {
  const { data } = await axiosAdminClient.get<AdminProfileResponse>(
    "/api/auth",
  );
  return data;
};
