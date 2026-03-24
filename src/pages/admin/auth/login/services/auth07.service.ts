import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult, type ApiResponse } from "./auth.util";

export const logout = async (): Promise<AdminAuthResult> => {
  try {
    const { data } = await axiosAdminClient.post<ApiResponse>(
      "/api/auth/logout",
    );
    if (!data?.success) {
      return { success: false, message: data?.message ?? undefined, errors: data?.errors };
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
