import { Plus } from "lucide-react";

type ShiftWorkspaceHeaderProps = {
  isRefreshing: boolean;
  canAssignmentWrite: boolean;
  onRefresh: () => void;
  onCreateAssignment: () => void;
};

const ShiftWorkspaceHeader = ({
  isRefreshing,
  canAssignmentWrite,
  onRefresh,
  onCreateAssignment,
}: ShiftWorkspaceHeaderProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Shift Workspace</h1>
        <p className="text-sm text-gray-600">
          Quản lý ca làm và phân ca theo lịch trong cùng một màn hình
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? "Đang tải..." : "Làm mới"}
        </button>

        {canAssignmentWrite && (
          <button
            type="button"
            onClick={onCreateAssignment}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus size={16} />
            Phân ca mới
          </button>
        )}
      </div>
    </div>
  );
};

export default ShiftWorkspaceHeader;
