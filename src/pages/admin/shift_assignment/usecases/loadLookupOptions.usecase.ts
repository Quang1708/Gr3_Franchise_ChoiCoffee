import { getAllShifts } from "../../shift/services/shift01.service";
import { searchUsersApi } from "../../user/services/user03.service";
import type { SearchShiftRequest } from "../../shift/models/ShiftRequest02.model";
import {
  normalizeArray,
  isStaffUser,
  getUserLabel,
} from "../utils/shiftAssignment.helpers";

type SelectOption = {
  value: string;
  label: string;
};

type LookupOptions = {
  staffOptions: SelectOption[];
  shiftOptions: SelectOption[];
};

export const loadLookupOptions = async (
  franchiseId: string | null,
): Promise<LookupOptions> => {
  const [usersRes, shiftsRes] = await Promise.all([
    searchUsersApi({
      searchCondition: {
        keyword: "",
        is_active: true,
        is_deleted: false,
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
    .filter((u) => Boolean(u.id))
    .map((u) => ({
      value: String(u.id),
      label: getUserLabel(u),
    }));

  const shiftOptions = normalizeArray(shiftsRes)
    .filter((s) => Boolean(s.id))
    .map((s) => {
      const start = String(s.start_time ?? s.startTime ?? "");
      const end = String(s.end_time ?? s.endTime ?? "");
      const name = String(
        s.name ?? s.shift_name ?? s.shiftName ?? `Ca ${String(s.id)}`,
      );
      const timeLabel = start && end ? ` (${start} - ${end})` : "";
      return {
        value: String(s.id),
        label: `${name}${timeLabel}`,
      };
    });

  return { staffOptions, shiftOptions };
};
