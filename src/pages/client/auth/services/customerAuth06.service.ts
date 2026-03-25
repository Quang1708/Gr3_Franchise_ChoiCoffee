import { axiosClient } from "@/api/axios.config";
import type { ApiErrorResponse } from "@/models";

const isUnauthenticatedLogoutError = (error: unknown): boolean => {
  const err = error as {
    response?: { status?: number; data?: ApiErrorResponse };
    status?: number;
    message?: string;
  };

  const status = err?.response?.status ?? err?.status;
  const message = err?.response?.data?.message ?? err?.message ?? "";

  if (status === 401) return true;

  return /access token|refresh token|expired|login|đăng nhập/i.test(message);
};

/**
 * Customer Logout
 * POST /api/customer-auth/logout
 */
export const customerLogout = async (): Promise<void> => {
  try {
    await axiosClient.post("/api/customer-auth/logout");
  } catch (error) {
    // If session is already invalid/expired, treat as logged out.
    if (isUnauthenticatedLogoutError(error)) {
      return;
    }

    throw error;
  }
};
