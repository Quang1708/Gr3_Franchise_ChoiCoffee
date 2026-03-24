import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult, type ApiResponse } from "./auth.util";

export const verifyToken = async (token: string): Promise<AdminAuthResult> => {
  try {
    const { data } = await axiosAdminClient.post<ApiResponse>(
      "/api/auth/verify-token",
      {
      token,
      },
    );
    if (!data?.success) {
      return { success: false, message: data?.message ?? undefined, errors: data?.errors };
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
