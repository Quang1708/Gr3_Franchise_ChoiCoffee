import type { ShiftAssignmentItem } from "@/pages/admin/shift_assignment/models/shiftAssignment.model";

export const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export const toDateInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const monthLabel = (date: Date): string => {
  return date.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });
};

export const buildCalendarDays = (monthDate: Date): Date[] => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const calendarStart = new Date(year, month, 1 - firstWeekday);

  return Array.from({ length: 42 }, (_, idx) => {
    const d = new Date(calendarStart);
    d.setDate(calendarStart.getDate() + idx);
    return d;
  });
};

export const getTimeRange = (assignment: ShiftAssignmentItem): string => {
  if (assignment.start_time && assignment.end_time) {
    return `${assignment.start_time} - ${assignment.end_time}`;
  }

  return "Không rõ giờ";
};
