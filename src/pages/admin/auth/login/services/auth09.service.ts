import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult, type ApiResponse } from "./auth.util";

export const resendToken = async (email: string): Promise<AdminAuthResult> => {
  try {
    const { data } = await axiosAdminClient.post<ApiResponse>(
      "/api/auth/resend-token",
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
