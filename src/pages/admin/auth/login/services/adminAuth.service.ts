/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosAdminClient } from "@/api/axios.config";

interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ message: string; field?: string }>;
}


/* AUTH-05 */
export const forgotPassword = async (email: string) => {
  try {
    const res = await axiosAdminClient.put<ApiResponse>(
      "/api/auth/forgot-password",
      { email },
    );
    return res.data;
  } catch (error: any) {
    if (error?.response?.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      data: null,
      message: error?.message || "Không thể xử lý yêu cầu.",
      errors: [],
    } as ApiResponse;
  }
};

/* AUTH-06 */
export const changePassword = async (
  old_password: string,
  new_password: string,
) => {
  try {
    const res = await axiosAdminClient.put("/api/auth/change-password", {
      old_password,
      new_password,
    });

    return res.data;
  } catch (error: any) {
    return error.response?.data;
  }
};



