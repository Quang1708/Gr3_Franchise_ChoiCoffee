import { axiosClient } from "@/api/axios.config";
import { USER_SEED_DATA } from "../mocks/user.seed";
import { USER_FRANCHISE_ROLE_SEED_DATA } from "../mocks/user_franchise_role.seed";
import { ROLE_SEED_DATA } from "../mocks/role.seed";

export type UpdateRoleResult = { ok: true } | { ok: false; message: string };
export type UserListItem = {
  id: number;
  email: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  roleCode: string;
  createdAt: string;
  updatedAt: string;
};

const USE_MOCK_ROLE_API =
  !import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_MOCK_USER_API === "true";

function mapSeedUsersToList(): UserListItem[] {
  return USER_SEED_DATA.filter((user) => !user.isDeleted).map((user) => {
    const userRole = USER_FRANCHISE_ROLE_SEED_DATA.find(
      (role) => role.userId === user.id && !role.isDeleted,
    );
    const roleCode =
      ROLE_SEED_DATA.find((role) => role.id === userRole?.roleId)?.code ??
      "STAFF";

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      roleCode,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  });
}

export async function getUsers(): Promise<UserListItem[]> {
  if (USE_MOCK_ROLE_API) {
    await new Promise((r) => setTimeout(r, 250));
    return mapSeedUsersToList();
  }

  const { data } = await axiosClient.get("/users");
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((user) => ({
    id: Number(user.id),
    email: String(user.email ?? ""),
    name: String(user.name ?? ""),
    phone: String(user.phone ?? ""),
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? undefined,
    roleCode: String(
      user.roleCode ?? user.role_code ?? user.roles?.[0]?.role_code ?? "STAFF",
    ),
    createdAt: String(
      user.createdAt ?? user.created_at ?? new Date().toISOString(),
    ),
    updatedAt: String(
      user.updatedAt ?? user.updated_at ?? new Date().toISOString(),
    ),
  }));
}

/**
 * Gọi API cập nhật vai trò user (US-3.3 – Change User Role).
 * Backend: PUT /users/:userId/role với body { role }.
 * Khi chưa có backend (không set VITE_API_BASE_URL hoặc VITE_MOCK_USER_API=true), dùng mock thành công.
 */
export async function updateUserRole(
  userId: string,
  roleCode: string,
): Promise<UpdateRoleResult> {
  if (USE_MOCK_ROLE_API) {
    await new Promise((r) => setTimeout(r, 300));
    return { ok: true };
  }
  try {
    await axiosClient.put(`/users/${userId}/role`, { role: roleCode });
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
