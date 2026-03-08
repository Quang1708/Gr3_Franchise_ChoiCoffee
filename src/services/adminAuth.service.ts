import { axiosAdminClient } from "@/api/axios.config";

export type AdminAuthResult = {
  ok: boolean;
  message?: string;
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === "object" && error !== null) {
    const message = (error as { response?: { data?: { message?: string } } })
      .response?.data?.message;
    if (message) return message;
  }
  return "Có lỗi xảy ra, vui lòng thử lại sau.";
};

export const verifyToken = async (token: string): Promise<AdminAuthResult> => {
  try {
    await axiosAdminClient.post("/api/auth/verify-token", { token });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
};

export const forgotPassword = async (email: string): Promise<AdminAuthResult> => {
  try {
    await axiosAdminClient.put("/api/auth/forgot-password", { email });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
};

export const resendToken = async (email: string): Promise<AdminAuthResult> => {
  try {
    await axiosAdminClient.post("/api/auth/resend-token", { email });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<AdminAuthResult> => {
  try {
    await axiosAdminClient.put("/api/auth/change-password", {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: getErrorMessage(error) };
  }
};
