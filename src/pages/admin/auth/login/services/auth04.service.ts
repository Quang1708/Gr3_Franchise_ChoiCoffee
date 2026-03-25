import { axiosAdminClient } from "@/api/axios.config";
import { getErrorMessage, type AdminAuthResult, type ApiResponse } from "./auth.util";

export type UpdateAdminProfileRequest = {
  name: string;
  email: string;
  phone: string;
  avatar_url?: string;
};

export const updateAdminProfile = async (
  userId: string | number,
  payload: UpdateAdminProfileRequest,
): Promise<AdminAuthResult> => {
  const candidates: Array<{ method: "put" | "patch"; url: string }> = [
    // Matches Postman screenshot: PUT /api/users/:id
    { method: "put", url: `/api/users/${userId}` },
    { method: "patch", url: `/api/users/${userId}` },

    // Fallbacks (if backend uses different route)
    { method: "put", url: "/api/auth" },
    { method: "patch", url: "/api/auth" },
    { method: "put", url: "/api/auth/profile" },
    { method: "patch", url: "/api/auth/profile" },
    { method: "put", url: "/api/auth/update-profile" },
    { method: "patch", url: "/api/auth/update-profile" },
  ];

  let lastError: unknown;

  for (const c of candidates) {
    try {
      const req =
        c.method === "put"
          ? axiosAdminClient.put<ApiResponse>(c.url, payload)
          : axiosAdminClient.patch<ApiResponse>(c.url, payload);

      const { data } = await req;

      if (!data?.success) {
        return {
          success: false,
          message: data?.message ?? undefined,
          errors: data?.errors,
        };
      }

      return { success: true };
    } catch (error) {
      lastError = error;
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status !== 404) {
        return { success: false, message: getErrorMessage(error) };
      }
      // If 404, try next candidate endpoint.
    }
  }

  return { success: false, message: getErrorMessage(lastError) };
};

