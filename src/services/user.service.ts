import { userApi } from "@/api";

export type UpdateRoleResult = { ok: true } | { ok: false; message: string };
export type ServiceResult = { ok: true } | { ok: false; message: string };

export type CreateUserPayload = {
  email: string;
  password: string;
  name: string;
  phone: string;
  roleCode: string;
  avatarUrl?: string;
};

export type UpdateUserPayload = {
  email: string;
  name: string;
  phone: string;
  roleCode: string;
  avatarUrl?: string;
  password?: string;
};

export type UserMutationResult =
  | { ok: true; user: UserListItem }
  | { ok: false; message: string };

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

const getErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ||
  (err as Error)?.message ||
  fallback;

const toSafeString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return `${value}`;
  }
  return fallback;
};

function mapUserRecord(raw: unknown): UserListItem {
  const user = raw as Record<string, unknown>;
  const roles = Array.isArray(user.roles)
    ? (user.roles as Array<Record<string, unknown>>)
    : [];

  return {
    id: Number(user.id ?? 0),
    email: toSafeString(user.email),
    name: toSafeString(user.name),
    phone: toSafeString(user.phone),
    avatarUrl:
      (user.avatarUrl as string | undefined) ??
      (user.avatar_url as string | undefined) ??
      undefined,
    roleCode: toSafeString(
      user.roleCode ?? user.role_code ?? roles[0]?.role_code,
      "STAFF",
    ),
    createdAt: toSafeString(
      user.createdAt ?? user.created_at,
      new Date().toISOString(),
    ),
    updatedAt: toSafeString(
      user.updatedAt ?? user.updated_at,
      new Date().toISOString(),
    ),
  };
}

function extractUsersArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as {
    data?: unknown;
    items?: unknown;
    rows?: unknown;
  };

  if (Array.isArray(data.data)) return data.data;
  if (data.data && typeof data.data === "object") {
    const nestedData = data.data as { items?: unknown; rows?: unknown };
    if (Array.isArray(nestedData.items)) return nestedData.items;
    if (Array.isArray(nestedData.rows)) return nestedData.rows;
  }
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.rows)) return data.rows;

  return [];
}

export async function getUsers(): Promise<UserListItem[]> {
  try {
    const data = await userApi.getAll();
    const usersRaw = extractUsersArray(data);
    if (usersRaw.length > 0) {
      return usersRaw.map((raw) => mapUserRecord(raw));
    }
  } catch {
    void 0;
  }

  try {
    const data = await userApi.search({
      keyword: "",
      page: 1,
      limit: 200,
    });
    const usersRaw = extractUsersArray(data);
    return usersRaw.map((raw) => mapUserRecord(raw));
  } catch {
    return [];
  }
}

export async function getUserById(
  userId: number | string,
): Promise<UserListItem | null> {
  const data = await userApi.getById(userId);
  const userRaw = data?.data ?? data;
  if (!userRaw || typeof userRaw !== "object") {
    return null;
  }

  return mapUserRecord(userRaw);
}

export async function createUser(
  payload: CreateUserPayload,
): Promise<UserMutationResult> {
  try {
    const data = await userApi.create({
      email: payload.email,
      password: payload.password,
      name: payload.name,
      phone: payload.phone,
      role_code: payload.roleCode,
      avatar_url: payload.avatarUrl,
    });

    const userRaw = data?.data ?? data;
    return { ok: true, user: mapUserRecord(userRaw) };
  } catch (err: unknown) {
    return { ok: false, message: getErrorMessage(err, "Tạo user thất bại") };
  }
}

export async function updateUser(
  userId: number | string,
  payload: UpdateUserPayload,
): Promise<UserMutationResult> {
  try {
    const data = await userApi.update(userId, {
      email: payload.email,
      name: payload.name,
      phone: payload.phone,
      role_code: payload.roleCode,
      avatar_url: payload.avatarUrl,
      ...(payload.password ? { password: payload.password } : {}),
    });

    const userRaw = data?.data ?? data;
    return { ok: true, user: mapUserRecord({ id: userId, ...userRaw }) };
  } catch (err: unknown) {
    return {
      ok: false,
      message: getErrorMessage(err, "Cập nhật user thất bại"),
    };
  }
}

export async function deleteUser(userId: number | string): Promise<ServiceResult> {
  try {
    await userApi.remove(userId);
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, message: getErrorMessage(err, "Xóa user thất bại") };
  }
}

export async function restoreUser(userId: number | string): Promise<ServiceResult> {
  try {
    await userApi.restore(userId);
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, message: getErrorMessage(err, "Khôi phục user thất bại") };
  }
}

export async function changeUserStatus(
  userId: number | string,
  status: string,
): Promise<ServiceResult> {
  try {
    await userApi.changeStatus(userId, { status });
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      message: getErrorMessage(err, "Đổi trạng thái user thất bại"),
    };
  }
}

export async function updateUserRole(
  userId: string,
  roleCode: string,
): Promise<UpdateRoleResult> {
  try {
    await userApi.update(userId, { role: roleCode });
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      message: getErrorMessage(err, "Cập nhật vai trò thất bại"),
    };
  }
}
