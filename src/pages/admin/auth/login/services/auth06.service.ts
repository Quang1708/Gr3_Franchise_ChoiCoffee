import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult } from "./auth.util";

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<AdminAuthResult> => {
  try {
    await axiosAdminClient.put("/api/auth/change-password", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: getErrorMessage(error) };
  }
};
