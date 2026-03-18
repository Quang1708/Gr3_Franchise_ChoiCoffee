import { z } from "zod";

// ── Search Schema ─────────────────────────────────────────────────────────────

export const shiftAssignmentSearchSchema = z.object({
  shift_id: z.string().optional(),
  user_id: z.string().optional(),
  work_date: z.string().optional(),
  assigned_by: z.string().optional(),
  status: z.string().optional(),
  is_deleted: z.boolean().optional(),
  pageNum: z.number(),
  pageSize: z.number(),
});

// ── Create/Edit Schema ────────────────────────────────────────────────────────

export const getShiftAssignmentSchema = (mode: "create" | "edit" | "view") => {
  const baseSchema = z.object({
    user_id: z.string().min(1, "Nhân viên là bắt buộc"),
    shift_id: z.string().min(1, "Ca làm là bắt buộc"),
    work_date: z.string().min(1, "Ngày làm là bắt buộc"),
    note: z.string().optional(),
  });

  if (mode === "view") {
    return baseSchema.partial();
  }

  return baseSchema.refine(
    (data) => {
      // Validate work_date is a valid date
      const date = new Date(data.work_date);
      return !isNaN(date.getTime());
    },
    {
      message: "Ngày làm không hợp lệ",
      path: ["work_date"],
    },
  );
};

// ── Bulk Create Schema ────────────────────────────────────────────────────────

export const shiftAssignmentBulkSchema = z.object({
  items: z
    .array(
      z.object({
        user_id: z.string().min(1, "Nhân viên là bắt buộc"),
        shift_id: z.string().min(1, "Ca làm là bắt buộc"),
        work_date: z.string().min(1, "Ngày làm là bắt buộc"),
        note: z.string().optional(),
      }),
    )
    .min(1, "Cần ít nhất 1 dòng"),
});

// ── Status Update Schema ──────────────────────────────────────────────────────

export const shiftAssignmentStatusSchema = z.object({
  status: z.enum(["ASSIGNED", "COMPLETED", "ABSENT", "CANCELED"], {
    message: "Trạng thái không hợp lệ",
  }),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type ShiftAssignmentInput = z.infer<
  ReturnType<typeof getShiftAssignmentSchema>
>;
export type ShiftAssignmentSearchInput = z.infer<
  typeof shiftAssignmentSearchSchema
>;
export type ShiftAssignmentBulkInput = z.infer<
  typeof shiftAssignmentBulkSchema
>;
export type ShiftAssignmentStatusInput = z.infer<
  typeof shiftAssignmentStatusSchema
>;
