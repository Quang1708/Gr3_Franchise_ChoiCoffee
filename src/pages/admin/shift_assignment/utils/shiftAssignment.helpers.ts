import type {
  ShiftAssignmentItem,
  ShiftAssignmentStatus,
} from "../models/shiftAssignment.model";

// ── Response Extraction Helpers ──────────────────────────────────────────────

export const extractArray = (payload: unknown): ShiftAssignmentItem[] => {
  if (Array.isArray(payload)) return payload as ShiftAssignmentItem[];
  if (!payload || typeof payload !== "object") return [];
  const data = payload as { data?: unknown; items?: unknown; rows?: unknown };
  if (Array.isArray(data.data)) return data.data as ShiftAssignmentItem[];
  if (data.data && typeof data.data === "object") {
    const nested = data.data as { items?: unknown; rows?: unknown };
    if (Array.isArray(nested.items))
      return nested.items as ShiftAssignmentItem[];
    if (Array.isArray(nested.rows)) return nested.rows as ShiftAssignmentItem[];
  }
  if (Array.isArray(data.items)) return data.items as ShiftAssignmentItem[];
  if (Array.isArray(data.rows)) return data.rows as ShiftAssignmentItem[];
  return [];
};

export const extractItem = (payload: unknown): ShiftAssignmentItem | null => {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as { data?: unknown };
  const raw = (data.data ?? payload) as Record<string, unknown>;
  const nestedUser =
    raw.user && typeof raw.user === "object"
      ? (raw.user as Record<string, unknown>)
      : undefined;
  const id =
    (raw.id as string | undefined) ?? (raw._id as string | undefined) ?? "";
  if (!id) return null;
  return {
    id,
    user_id: String(raw.user_id ?? ""),
    user_name: raw.user_name
      ? String(raw.user_name)
      : raw.userName
        ? String(raw.userName)
        : nestedUser?.name
          ? String(nestedUser.name)
          : undefined,
    shift_id: String(raw.shift_id ?? ""),
    start_time: raw.start_time ? String(raw.start_time) : undefined,
    end_time: raw.end_time ? String(raw.end_time) : undefined,
    work_date: String(raw.work_date ?? ""),
    assigned_by: raw.assigned_by ? String(raw.assigned_by) : undefined,
    note: raw.note ? String(raw.note) : undefined,
    status: String(raw.status ?? "ASSIGNED") as ShiftAssignmentStatus,
    is_deleted: Boolean(raw.is_deleted),
    created_at: raw.created_at ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at ? String(raw.updated_at) : undefined,
  };
};

export const toRow = (raw: ShiftAssignmentItem): ShiftAssignmentItem => ({
  id: String(raw.id),
  user_id: String(raw.user_id),
  user_name: raw.user_name,
  shift_id: String(raw.shift_id),
  start_time: raw.start_time,
  end_time: raw.end_time,
  work_date: String(raw.work_date),
  assigned_by: raw.assigned_by,
  assigned_by_name: raw.assigned_by_name,
  note: raw.note,
  status: (raw.status ?? "ASSIGNED") as ShiftAssignmentStatus,
  is_deleted: Boolean(raw.is_deleted),
  created_at: raw.created_at,
  updated_at: raw.updated_at,
});

export const mergeShiftAssignmentItem = (
  fallback: ShiftAssignmentItem,
  detail: ShiftAssignmentItem | null,
): ShiftAssignmentItem => {
  if (!detail) return { ...fallback };

  return {
    ...fallback,
    ...detail,
    user_name: detail.user_name ?? fallback.user_name,
    start_time: detail.start_time ?? fallback.start_time,
    end_time: detail.end_time ?? fallback.end_time,
    assigned_by: detail.assigned_by ?? fallback.assigned_by,
    assigned_by_name: detail.assigned_by_name ?? fallback.assigned_by_name,
    note: detail.note ?? fallback.note,
    created_at: detail.created_at ?? fallback.created_at,
    updated_at: detail.updated_at ?? fallback.updated_at,
  };
};

export const getAssignedByDisplayName = (
  payload: Record<string, unknown>,
  fallbackId: string,
) => {
  const data = (payload?.data ?? payload) as Record<string, unknown>;
  return String(
    data?.name ??
      data?.full_name ??
      data?.fullName ??
      data?.username ??
      data?.email ??
      fallbackId,
  );
};

// ── Data Normalization Helpers ───────────────────────────────────────────────

export const normalizeArray = (payload: unknown): Record<string, unknown>[] => {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (!payload || typeof payload !== "object") return [];

  const data = payload as {
    data?: unknown;
    items?: unknown;
    rows?: unknown;
  };

  if (Array.isArray(data.data)) return data.data as Record<string, unknown>[];
  if (data.data && typeof data.data === "object") {
    const nested = data.data as { items?: unknown; rows?: unknown };
    if (Array.isArray(nested.items))
      return nested.items as Record<string, unknown>[];
    if (Array.isArray(nested.rows))
      return nested.rows as Record<string, unknown>[];
  }

  if (Array.isArray(data.items)) return data.items as Record<string, unknown>[];
  if (Array.isArray(data.rows)) return data.rows as Record<string, unknown>[];
  return [];
};

// ── User Helpers ──────────────────────────────────────────────────────────────

export const isStaffUser = (user: Record<string, unknown>) => {
  const directRoleCode = String(
    user.roleCode ?? user.role_code ?? "",
  ).toUpperCase();
  if (directRoleCode === "STAFF") return true;

  const roleObj =
    user.role && typeof user.role === "object"
      ? (user.role as Record<string, unknown>)
      : undefined;
  const roleFromObject = String(
    roleObj?.role_code ?? roleObj?.roleCode ?? roleObj?.code ?? "",
  ).toUpperCase();
  if (roleFromObject === "STAFF") return true;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((role) => {
    if (!role || typeof role !== "object") return false;
    const r = role as Record<string, unknown>;
    const roleCode = String(
      r.role_code ?? r.roleCode ?? r.code ?? "",
    ).toUpperCase();
    return roleCode === "STAFF";
  });
};

export const getUserLabel = (user: Record<string, unknown>) => {
  const name = String(user.name ?? "").trim();
  const email = String(user.email ?? "").trim();
  const phone = String(user.phone ?? "").trim();
  return name || email || phone || String(user.id ?? "");
};
