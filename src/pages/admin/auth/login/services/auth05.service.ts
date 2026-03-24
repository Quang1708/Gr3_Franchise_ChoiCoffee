import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult, type ApiResponse } from "./auth.util";

export const forgotPassword = async (
  email: string,
): Promise<AdminAuthResult> => {
  try {
    const { data } = await axiosAdminClient.put<ApiResponse>(
      "/api/auth/forgot-password",
      { email },
    );
    if (!data?.success) {
      return { success: false, message: data?.message ?? undefined, errors: data?.errors };
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
