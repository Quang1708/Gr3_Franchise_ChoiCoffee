import { RefreshCw } from "lucide-react";
import { STATUS_OPTIONS } from "../shiftAssignment.utils";

type SearchCondition = {
  shift_id: string;
  user_id: string;
  work_date: string;
  assigned_by: string;
  status: string;
  is_deleted: boolean;
};

type Props = {
  searchCondition: SearchCondition;
  setSearchCondition: React.Dispatch<React.SetStateAction<SearchCondition>>;
  onSearch: () => void;
  onReset: () => void;
  onReload: () => void;
};

export const ShiftAssignmentSearch = ({
  searchCondition,
  setSearchCondition,
  onSearch,
  onReset,
  onReload,
}: Props) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <h1 className="text-2xl font-bold text-gray-800 mb-4 uppercase">
      Quản lý Phân Ca
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      <input
        className="rounded-lg border border-gray-200 px-3 py-2"
        placeholder="Mã ca làm"
        value={searchCondition.shift_id}
        onChange={(e) =>
          setSearchCondition((prev) => ({ ...prev, shift_id: e.target.value }))
        }
      />
      <input
        className="rounded-lg border border-gray-200 px-3 py-2"
        placeholder="Mã nhân viên"
        value={searchCondition.user_id}
        onChange={(e) =>
          setSearchCondition((prev) => ({ ...prev, user_id: e.target.value }))
        }
      />
      <input
        type="date"
        className="rounded-lg border border-gray-200 px-3 py-2"
        value={searchCondition.work_date}
        onChange={(e) =>
          setSearchCondition((prev) => ({
            ...prev,
            work_date: e.target.value,
          }))
        }
      />
      <input
        className="rounded-lg border border-gray-200 px-3 py-2"
        placeholder="Người phân ca"
        value={searchCondition.assigned_by}
        onChange={(e) =>
          setSearchCondition((prev) => ({
            ...prev,
            assigned_by: e.target.value,
          }))
        }
      />
      <select
        className="rounded-lg border border-gray-200 px-3 py-2"
        value={searchCondition.status}
        onChange={(e) =>
          setSearchCondition((prev) => ({ ...prev, status: e.target.value }))
        }
      >
        <option value="">Tất cả trạng thái</option>
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>

    <div className="mt-3 flex flex-wrap gap-2">
      <button
        type="button"
        className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        onClick={onSearch}
      >
        Tìm kiếm
      </button>
      <button
        type="button"
        className="cursor-pointer rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        onClick={onReset}
      >
        Reset bộ lọc
      </button>
      <button
        type="button"
        className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        onClick={onReload}
      >
        <RefreshCw size={14} />
        Làm mới
      </button>
    </div>
  </div>
);
