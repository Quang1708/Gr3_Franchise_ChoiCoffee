import type { ShiftAssignmentStatus } from "./models/shiftAssignment.model";

export const STATUS_OPTIONS: ShiftAssignmentStatus[] = [
  "ASSIGNED",
  "COMPLETED",
  "ABSENT",
  "CANCELED",
];

export const today = new Date().toISOString().slice(0, 10);

export const statusBadge = (status: ShiftAssignmentStatus) => {
  if (status === "ASSIGNED") return "bg-blue-100 text-blue-700";
  if (status === "COMPLETED") return "bg-green-100 text-green-700";
  if (status === "ABSENT") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

export const formatDateTime = (value?: string) => {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};
