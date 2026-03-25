import { getAllShifts } from "../../shift/services/shift01.service";
import { userFranchiseRoleService } from "../../user-franchise-role/services/userFranchiseRole.service";
import type { SearchShiftRequest } from "../../shift/models/ShiftRequest02.model";
import { normalizeArray, getUserLabel } from "../utils/shiftAssignment.helpers";

type SelectOption = {
  value: string;
  label: string;
  franchiseId?: string;
};

type LookupOptions = {
  staffOptions: SelectOption[];
  shiftOptions: SelectOption[];
};

const STAFF_ROLE_ID = "69a1aa8be6a85d288f9b4a28";

type LoadLookupOptionsInput =
  | string
  | null
  | {
      franchiseId?: string | null;
      allowedFranchiseIds?: string[];
      restrictToUserId?: string;
      includeFranchiseName?: boolean;
    };

const toScopedParams = (input: LoadLookupOptionsInput) => {
  if (typeof input === "object" && input !== null && !Array.isArray(input)) {
    const baseFranchiseId = input.franchiseId ?? null;
    const allowedFranchiseIds = (input.allowedFranchiseIds ?? [])
      .map((id) => String(id || "").trim())
      .filter(Boolean);

    return {
      franchiseId: baseFranchiseId,
      allowedFranchiseIds,
      restrictToUserId: String(input.restrictToUserId ?? "").trim(),
      includeFranchiseName: Boolean(input.includeFranchiseName),
    };
  }

  return {
    franchiseId: input,
    allowedFranchiseIds: [],
    restrictToUserId: "",
    includeFranchiseName: false,
  };
};

const hasAnyFranchiseInScope = (
  row: Record<string, unknown>,
  franchiseIds: string[],
) => {
  if (franchiseIds.length === 0) return true;

  const inScope = new Set(franchiseIds.map((id) => String(id)));
  const directFranchiseId = String(
    row.franchise_id ?? row.franchiseId ?? "",
  ).trim();
  return Boolean(directFranchiseId) && inScope.has(directFranchiseId);
};

const toUserLikeRecord = (row: Record<string, unknown>) => {
  const nestedUser =
    row.user && typeof row.user === "object"
      ? (row.user as Record<string, unknown>)
      : {};

  return {
    id: row.user_id ?? nestedUser.id ?? "",
    name: row.user_name ?? nestedUser.name ?? "",
    email: row.user_email ?? nestedUser.email ?? "",
    phone: row.user_phone ?? nestedUser.phone ?? "",
    franchise_name: row.franchise_name ?? row.franchiseName ?? "",
  } satisfies Record<string, unknown>;
};

export const loadLookupOptions = async (
  input: LoadLookupOptionsInput,
): Promise<LookupOptions> => {
  const {
    franchiseId,
    allowedFranchiseIds,
    restrictToUserId,
    includeFranchiseName,
  } = toScopedParams(input);

  const [usersRes, shiftsRes] = await Promise.all([
    userFranchiseRoleService.search({
      searchCondition: {
        role_id: STAFF_ROLE_ID,
        is_deleted: false,
        is_active: true,
        franchise_id: franchiseId || undefined,
      },
      pageInfo: {
        pageNum: 1,
        pageSize: 500,
      },
    }),
    getAllShifts({
      searchCondition: {
        franchise_id: franchiseId || "",
        is_deleted: false,
      },
      pageInfo: { pageNum: 1, pageSize: 200 },
    } as SearchShiftRequest),
  ]);

  const staffOptions = normalizeArray(usersRes)
    .filter((row) => hasAnyFranchiseInScope(row, allowedFranchiseIds))
    .map((row) => toUserLikeRecord(row))
    .filter((user) => {
      if (!restrictToUserId) return true;
      return String(user.id ?? "") === restrictToUserId;
    })
    .filter((user) => Boolean(user.id))
    .reduce<SelectOption[]>((acc, user) => {
      const value = String(user.id);
      if (acc.some((item) => item.value === value)) return acc;
      const baseLabel = getUserLabel(user);
      const franchiseName = String(user.franchise_name ?? "").trim();
      const label =
        includeFranchiseName && franchiseName
          ? `${baseLabel} - ${franchiseName}`
          : baseLabel;

      acc.push({ value, label });
      return acc;
    }, []);

  const shiftOptions = normalizeArray(shiftsRes)
    .filter((s) => Boolean(s.id))
    .map((s) => {
      const start = String(s.start_time ?? s.startTime ?? "");
      const end = String(s.end_time ?? s.endTime ?? "");
      const franchiseId = String(s.franchise_id ?? s.franchiseId ?? "");
      const franchiseName = String(
        s.franchise_name ?? s.franchiseName ?? "",
      ).trim();
      const name = String(
        s.name ?? s.shift_name ?? s.shiftName ?? `Ca ${String(s.id)}`,
      );
      const timeLabel = start && end ? ` (${start} - ${end})` : "";
      const franchiseLabel =
        includeFranchiseName && franchiseName ? ` - ${franchiseName}` : "";
      return {
        value: String(s.id),
        label: `${name}${timeLabel}${franchiseLabel}`,
        franchiseId,
      };
    });

  return { staffOptions, shiftOptions };
};
