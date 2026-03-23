import type { Shift } from "@/pages/admin/shift/models/ShiftReponse.model";
import type { FormEvent } from "react";

type FranchiseOption = {
  value: string;
  name: string;
};

type ShiftCreateForm = {
  name: string;
  start_time: string;
  end_time: string;
  franchise_id: string;
};

type ShiftSidebarSectionProps = {
  canShiftRead: boolean;
  canShiftWrite: boolean;
  isGlobalContext: boolean;
  isCreatingShift: boolean;
  shiftForm: ShiftCreateForm;
  franchises: FranchiseOption[];
  visibleShifts: Shift[];
  franchiseNameMap: Record<string, string>;
  onFormChange: (next: ShiftCreateForm) => void;
  onCreateShift: (e: FormEvent<HTMLFormElement>) => void;
};

const ShiftSidebarSection = ({
  canShiftRead,
  canShiftWrite,
  isGlobalContext,
  isCreatingShift,
  shiftForm,
  franchises,
  visibleShifts,
  franchiseNameMap,
  onFormChange,
  onCreateShift,
}: ShiftSidebarSectionProps) => {
  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-4 xl:col-span-4 xl:flex xl:min-h-0 xl:flex-col xl:overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900">Thêm ca làm</h2>
      <p className="mb-4 text-sm text-gray-600">
        Sidebar quản lý nhanh danh sách ca làm và tạo ca mới.
      </p>

      {!canShiftWrite ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-3 py-5 text-sm text-gray-500">
          Bạn chưa có quyền thêm ca làm.
        </div>
      ) : (
        <form onSubmit={onCreateShift} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tên ca
            </label>
            <input
              value={shiftForm.name}
              onChange={(e) =>
                onFormChange({
                  ...shiftForm,
                  name: e.target.value,
                })
              }
              placeholder="Ví dụ: Ca sáng"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Bắt đầu
              </label>
              <input
                type="time"
                value={shiftForm.start_time}
                onChange={(e) =>
                  onFormChange({
                    ...shiftForm,
                    start_time: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Kết thúc
              </label>
              <input
                type="time"
                value={shiftForm.end_time}
                onChange={(e) =>
                  onFormChange({
                    ...shiftForm,
                    end_time: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {isGlobalContext && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Chi nhánh
              </label>
              <select
                value={shiftForm.franchise_id}
                onChange={(e) =>
                  onFormChange({
                    ...shiftForm,
                    franchise_id: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">-- Chọn chi nhánh --</option>
                {franchises.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isCreatingShift}
            className="cursor-pointer w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreatingShift ? "Đang thêm..." : "Thêm ca làm"}
          </button>
        </form>
      )}

      <div className="mt-5 border-t border-gray-100 pt-4 xl:min-h-0 xl:flex-1 xl:overflow-hidden">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Danh sách ca</h3>
          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {visibleShifts.length}
          </span>
        </div>

        {!canShiftRead && !canShiftWrite ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-xs text-gray-500">
            Bạn chưa có quyền xem ca làm.
          </div>
        ) : visibleShifts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-xs text-gray-500">
            Chưa có ca làm nào.
          </div>
        ) : (
          <div className="max-h-80 space-y-2 overflow-auto pr-1 xl:max-h-none xl:h-full">
            {visibleShifts.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <div className="text-sm font-medium text-gray-800">
                  {item.name}
                </div>
                <div className="text-xs text-gray-600">
                  {item.start_time} - {item.end_time}
                </div>
                {item.franchise_id && (
                  <div className="text-xs text-gray-500">
                    {franchiseNameMap[item.franchise_id] || item.franchise_id}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};

export default ShiftSidebarSection;
