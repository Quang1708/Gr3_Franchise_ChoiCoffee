import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult } from "./auth.util";

export const verifyToken = async (token: string): Promise<AdminAuthResult> => {
  try {
    const res = await axiosAdminClient.post("/api/auth/verify-token", {
      token,
    });
    const data = res?.data as { success?: boolean; message?: string } | null;
    if (data?.success === false) {
      return { success: false, message: data.message };
    }
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
