import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult } from "./auth.util";

export const forgotPassword = async (
  email: string,
): Promise<AdminAuthResult> => {
  try {
    await axiosAdminClient.put("/api/auth/forgot-password", { email });
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
