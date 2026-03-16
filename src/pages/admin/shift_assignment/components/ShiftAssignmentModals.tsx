import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  UserRound,
} from "lucide-react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import type {
  ShiftAssignmentBulkRow,
  ShiftAssignmentCreatePayload,
  ShiftAssignmentItem,
  ShiftAssignmentStatus,
} from "../models/shiftAssignment.model";
import {
  STATUS_OPTIONS,
  formatDateTime,
  statusBadge,
  today,
} from "../shiftAssignment.utils";

type Props = {
  // Create
  createOpen: boolean;
  setCreateOpen: (v: boolean) => void;
  createForm: ShiftAssignmentCreatePayload;
  setCreateForm: React.Dispatch<
    React.SetStateAction<ShiftAssignmentCreatePayload>
  >;
  onCreateSubmit: () => void;
  // Bulk
  bulkOpen: boolean;
  setBulkOpen: (v: boolean) => void;
  bulkItems: ShiftAssignmentBulkRow[];
  setBulkItems: React.Dispatch<React.SetStateAction<ShiftAssignmentBulkRow[]>>;
  onBulkSubmit: () => void;
  // Status
  statusOpen: boolean;
  setStatusOpen: (v: boolean) => void;
  nextStatus: ShiftAssignmentStatus;
  setNextStatus: React.Dispatch<React.SetStateAction<ShiftAssignmentStatus>>;
  onStatusSubmit: () => void;
  // Detail
  detailOpen: boolean;
  setDetailOpen: (v: boolean) => void;
  detailItem: ShiftAssignmentItem | null;
};

export const ShiftAssignmentModals = ({
  createOpen,
  setCreateOpen,
  createForm,
  setCreateForm,
  onCreateSubmit,
  bulkOpen,
  setBulkOpen,
  bulkItems,
  setBulkItems,
  onBulkSubmit,
  statusOpen,
  setStatusOpen,
  nextStatus,
  setNextStatus,
  onStatusSubmit,
  detailOpen,
  setDetailOpen,
  detailItem,
}: Props) => {
  const handleBulkAddRow = () => {
    setBulkItems((prev) => [
      ...prev,
      { user_id: "", shift_id: "", work_date: today, note: "" },
    ]);
  };

  const handleBulkRemoveRow = (idx: number) => {
    setBulkItems((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <>
      {/* ── Create Modal ─────────────────────────────── */}
      <CRUDModalTemplate
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={onCreateSubmit}
        title="Phân ca"
        mode="create"
        maxWidth="max-w-xl"
      >
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            placeholder="Mã nhân viên"
            value={createForm.user_id}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, user_id: e.target.value }))
            }
          />
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            placeholder="Mã ca làm"
            value={createForm.shift_id}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, shift_id: e.target.value }))
            }
          />
          <input
            type="date"
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={createForm.work_date}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, work_date: e.target.value }))
            }
          />
          <textarea
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            rows={3}
            placeholder="Ghi chú"
            value={createForm.note ?? ""}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, note: e.target.value }))
            }
          />
        </div>
      </CRUDModalTemplate>

      {/* ── Bulk Modal ───────────────────────────────── */}
      <CRUDModalTemplate
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSave={onBulkSubmit}
        title="Phân ca (nhiều)"
        mode="create"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-3 overflow-auto pr-1">
          {bulkItems.map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center"
            >
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 md:col-span-3"
                placeholder="Mã nhân viên"
                value={row.user_id}
                onChange={(e) => {
                  const next = [...bulkItems];
                  next[idx] = { ...next[idx], user_id: e.target.value };
                  setBulkItems(next);
                }}
              />
              <input
                className="rounded-lg border border-gray-200 px-3 py-2 md:col-span-3"
                placeholder="Mã ca làm"
                value={row.shift_id}
                onChange={(e) => {
                  const next = [...bulkItems];
                  next[idx] = { ...next[idx], shift_id: e.target.value };
                  setBulkItems(next);
                }}
              />
              <input
                type="date"
                className="rounded-lg border border-gray-200 px-3 py-2 md:col-span-3"
                value={row.work_date}
                onChange={(e) => {
                  const next = [...bulkItems];
                  next[idx] = { ...next[idx], work_date: e.target.value };
                  setBulkItems(next);
                }}
              />
              <button
                type="button"
                className="cursor-pointer rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50 md:col-span-3"
                onClick={() => handleBulkRemoveRow(idx)}
                disabled={bulkItems.length === 1}
              >
                Xóa dòng
              </button>
            </div>
          ))}
          <button
            type="button"
            className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={handleBulkAddRow}
          >
            + Thêm dòng
          </button>
        </div>
      </CRUDModalTemplate>

      {/* ── Status Modal ─────────────────────────────── */}
      <CRUDModalTemplate
        isOpen={statusOpen}
        onClose={() => setStatusOpen(false)}
        onSave={onStatusSubmit}
        title="trạng thái phân ca"
        mode="edit"
        maxWidth="max-w-md"
      >
        <div className="space-y-3">
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2"
            value={nextStatus}
            onChange={(e) =>
              setNextStatus(e.target.value as ShiftAssignmentStatus)
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </CRUDModalTemplate>

      {/* ── Detail Modal ─────────────────────────────── */}
      <CRUDModalTemplate
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="phân ca"
        mode="view"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
          {/* Header — status badge */}
          <div className="rounded-xl border border-primary/20 bg-linear-to-r from-primary/10 via-primary/5 to-white p-4">
            <div className="flex items-start justify-end gap-3">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                  detailItem?.status ?? "ASSIGNED",
                )}`}
              >
                <BadgeCheck size={14} />
                {detailItem?.status ?? "ASSIGNED"}
              </span>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <UserRound size={13} />
                Nhân viên
              </p>
              <p className="text-sm font-semibold text-gray-900 break-all">
                {detailItem?.user_name ?? detailItem?.user_id ?? "--"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <BriefcaseBusiness size={13} />
                Ca làm
              </p>
              {detailItem?.start_time && detailItem?.end_time ? (
                <p className="text-sm font-semibold text-gray-900">
                  {detailItem.start_time} &ndash; {detailItem.end_time}
                </p>
              ) : (
                <p className="text-sm font-semibold text-gray-900 break-all">
                  {detailItem?.shift_id ?? "--"}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <CalendarDays size={13} />
                Ngày làm
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {detailItem?.work_date ?? "--"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Người phân ca</p>
              <p className="text-sm font-semibold text-gray-900 break-all">
                {detailItem?.assigned_by_name ??
                  detailItem?.assigned_by ??
                  "--"}
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Tạo lúc</p>
              <p className="text-sm font-medium text-gray-800">
                {formatDateTime(detailItem?.created_at)}
              </p>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs text-gray-500 mb-1">Cập nhật lúc</p>
              <p className="text-sm font-medium text-gray-800">
                {formatDateTime(detailItem?.updated_at)}
              </p>
            </div>
          </div>

          {/* Note */}
          <div className="rounded-lg border border-gray-100 bg-white p-3">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <FileText size={13} />
              Ghi chú
            </p>
            <p className="text-sm text-gray-800 leading-6 whitespace-pre-wrap wrap-break-word">
              {detailItem?.note?.trim() ? detailItem.note : "Không có ghi chú"}
            </p>
          </div>
        </div>
      </CRUDModalTemplate>
    </>
  );
};
