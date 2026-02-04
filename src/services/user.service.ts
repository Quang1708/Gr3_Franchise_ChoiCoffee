import { axiosClient } from "./http/axiosClient";
import type { Role } from "../models/role.model";

export type UpdateRoleResult = { ok: true } | { ok: false; message: string };

const USE_MOCK_ROLE_API =
  !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_MOCK_USER_API === "true";

/**
 * Gọi API cập nhật vai trò user (US-3.3 – Change User Role).
 * Backend: PUT /users/:userId/role với body { role }.
 * Khi chưa có backend (không set VITE_API_BASE_URL hoặc VITE_MOCK_USER_API=true), dùng mock thành công.
 */
export async function updateUserRole(
  userId: string,
  role: Role,
): Promise<UpdateRoleResult> {
  if (USE_MOCK_ROLE_API) {
    await new Promise((r) => setTimeout(r, 300));
    return { ok: true };
  }
  try {
    await axiosClient.put(`/users/${userId}/role`, { role });
    return { ok: true };
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ||
      (err as Error)?.message ||
      "Cập nhật vai trò thất bại";
    return { ok: false, message };
  }
}
