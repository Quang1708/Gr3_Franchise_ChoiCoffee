import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult } from "./auth.util";

export const resendToken = async (email: string): Promise<AdminAuthResult> => {
  try {
    await axiosAdminClient.post("/api/auth/resend-token", { email });
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
