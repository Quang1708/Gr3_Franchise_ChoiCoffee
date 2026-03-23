import type { Column } from "@/components/Admin/template/CRUDPage.template";
import type { ShiftAssignmentItem } from "./models/shiftAssignment.model";
import { statusBadge } from "./shiftAssignment.utils";

const STATUS_LABEL_MAP: Record<ShiftAssignmentItem["status"], string> = {
  ASSIGNED: "Đã phân công",
  COMPLETED: "Hoàn thành",
  ABSENT: "Vắng mặt",
  CANCELED: "Đã hủy",
};

type GetShiftAssignmentColumnsParams = {
  isProcessing: boolean;
  isTableLoading: boolean;
  onChangeStatus: (
    item: ShiftAssignmentItem,
    newStatus: ShiftAssignmentItem["status"],
  ) => void;
};

export const getShiftAssignmentColumns = ({
  isProcessing,
  isTableLoading,
  onChangeStatus,
}: GetShiftAssignmentColumnsParams): Column<ShiftAssignmentItem>[] => {
  return [
    {
      header: "Nhân viên",
      accessor: "user_id",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-800">
          {item.user_name ?? item.user_id}
        </span>
      ),
    },
    {
      header: "Ca làm",
      accessor: "shift_id",
      sortable: true,
      render: (item) =>
        item.start_time && item.end_time ? (
          <span className="text-sm text-gray-700">
            {item.start_time} - {item.end_time}
          </span>
        ) : (
          <span className="text-sm text-gray-500">{item.shift_id}</span>
        ),
    },
    {
      header: "Ngày làm",
      accessor: "work_date",
      sortable: true,
    },
    {
      header: "Trạng thái",
      accessor: "status",
      render: (item) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadge(item.status)}`}
        >
          {STATUS_LABEL_MAP[item.status]}
        </span>
      ),
    },
    {
      header: "Đổi trạng thái",
      accessor: "id",
      render: (item) => (
        <select
          value={item.status}
          disabled={isProcessing || isTableLoading}
          onChange={(e) => {
            const newStatus = e.target.value as ShiftAssignmentItem["status"];
            if (newStatus !== item.status) {
              onChangeStatus(item, newStatus);
            }
          }}
          className={`w-full rounded-full border border-transparent px-2.5 py-1 text-xs font-medium ${statusBadge(item.status)} focus:outline-none focus:ring-2 focus:ring-primary/20`}
        >
          <option value="ASSIGNED">Đã phân công</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="ABSENT">Vắng mặt</option>
          <option value="CANCELED">Đã hủy</option>
        </select>
      ),
    },
    {
      header: "Người phân ca",
      accessor: "assigned_by",
      render: (item) => item.assigned_by_name ?? item.assigned_by ?? "--",
    },
  ];
};
