import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult } from "./auth.util";

export const verifyToken = async (token: string): Promise<AdminAuthResult> => {
  try {
    await axiosAdminClient.post("/api/auth/verify-token", { token });
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
