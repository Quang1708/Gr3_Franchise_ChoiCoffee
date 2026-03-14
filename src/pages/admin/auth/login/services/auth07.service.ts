import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult } from "./auth.util";

export const logout = async (): Promise<AdminAuthResult> => {
  try {
    await axiosAdminClient.post("/api/auth/log-out");
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
