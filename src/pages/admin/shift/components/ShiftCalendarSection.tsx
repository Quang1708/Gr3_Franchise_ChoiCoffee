import { statusBadge } from "@/pages/admin/shift_assignment/shiftAssignment.utils";
import type { ShiftAssignmentItem } from "@/pages/admin/shift_assignment/models/shiftAssignment.model";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  WEEKDAY_LABELS,
  getTimeRange,
  monthLabel,
  toDateInput,
} from "../shiftCalendar.utils";

type ShiftCalendarSectionProps = {
  canAssignmentRead: boolean;
  canAssignmentWrite: boolean;
  fullWidth?: boolean;
  monthAssignmentsCount: number;
  currentMonth: Date;
  calendarDays: Date[];
  assignmentsByDate: Record<string, ShiftAssignmentItem[]>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenCreateAssignment: (date?: string) => void;
  onOpenViewAssignment: (assignment: ShiftAssignmentItem) => void;
  onOpenDayAssignments: (date: string, items: ShiftAssignmentItem[]) => void;
};

const ShiftCalendarSection = ({
  canAssignmentRead,
  canAssignmentWrite,
  fullWidth = false,
  monthAssignmentsCount,
  currentMonth,
  calendarDays,
  assignmentsByDate,
  onPrevMonth,
  onNextMonth,
  onOpenCreateAssignment,
  onOpenViewAssignment,
  onOpenDayAssignments,
}: ShiftCalendarSectionProps) => {
  return (
    <section
      className={`rounded-2xl border border-gray-200 bg-white p-4 xl:flex xl:min-h-0 xl:flex-col ${
        fullWidth ? "xl:col-span-12" : "xl:col-span-8"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Lịch phân ca</h2>
          <p className="text-sm text-gray-600">
            {monthAssignmentsCount} ca được phân trong{" "}
            {monthLabel(currentMonth)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
            aria-label="Tháng trước"
            title="Tháng trước"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="min-w-44 rounded-lg border border-gray-200 px-3 py-2 text-center text-sm font-semibold text-gray-800">
            {monthLabel(currentMonth)}
          </div>

          <button
            type="button"
            onClick={onNextMonth}
            className="cursor-pointer rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
            aria-label="Tháng sau"
            title="Tháng sau"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {!canAssignmentRead ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500 xl:flex-1">
          Bạn chưa có quyền xem dữ liệu phân ca.
        </div>
      ) : (
        <div className="xl:min-h-0 xl:flex-1 xl:overflow-auto xl:pr-1 scrollbar-hide">
          <div className="grid grid-cols-7 gap-2">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="rounded-lg bg-gray-50 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dateKey = toDateInput(day);
              const items = assignmentsByDate[dateKey] ?? [];
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = dateKey === toDateInput(new Date());

              return (
                <div
                  key={dateKey}
                  className={`min-h-32 rounded-xl border p-2 ${
                    isCurrentMonth
                      ? "border-gray-200 bg-white"
                      : "border-gray-100 bg-gray-50 text-gray-400"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? "bg-primary text-white"
                          : "bg-transparent text-gray-700"
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {canAssignmentWrite && isCurrentMonth && (
                      <button
                        type="button"
                        onClick={() => onOpenCreateAssignment(dateKey)}
                        className="cursor-pointer rounded-md border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-600 hover:bg-gray-100"
                      >
                        +
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {items.slice(0, 3).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onOpenViewAssignment(item)}
                        className={`cursor-pointer w-full rounded-md px-1.5 py-1 text-left text-[11px] font-medium ${statusBadge(item.status)}`}
                      >
                        <div className="truncate">{getTimeRange(item)}</div>
                        <div className="truncate opacity-85">
                          {item.user_name ?? item.user_id}
                        </div>
                      </button>
                    ))}

                    {items.length > 3 && (
                      <button
                        type="button"
                        onClick={() => onOpenDayAssignments(dateKey, items)}
                        className="cursor-pointer w-full rounded-md bg-gray-100 px-1.5 py-1 text-left text-[11px] text-gray-600 hover:bg-gray-200"
                      >
                        +{items.length - 3} ca khác
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default ShiftCalendarSection;
