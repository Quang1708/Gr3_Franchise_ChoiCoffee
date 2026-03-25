import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult, type ApiResponse } from "./auth.util";

export type UpdateAdminProfileRequest = {
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
};

export const updateAdminProfile = async (
  payload: UpdateAdminProfileRequest,
): Promise<AdminAuthResult> => {
  try {
    const { data } = await axiosAdminClient.put<ApiResponse>(
      "/api/auth",
      payload,
    );

    if (!data?.success) {
      return {
        success: false,
        message: data?.message ?? undefined,
        errors: data?.errors,
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};

