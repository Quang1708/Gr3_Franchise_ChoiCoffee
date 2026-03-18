import { z } from "zod";

export const shiftSearchSchema = z.object({
    name: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    franchise_id: z.string().optional(),
    pageNum: z.number(),
    pageSize: z.number(),
});

export const getShiftSchema = (mode: "create" | "edit" | "view") => {
    return z.object({
        name: z.string().min(1, "Tên ca làm việc là bắt buộc"),
        start_time: z.string().min(1, "Thời gian bắt đầu là bắt buộc"),
        end_time: z.string().min(1, "Thời gian kết thúc là bắt buộc"),
        franchise_id: z.string().min(1, "Chi nhánh là bắt buộc"),
    }).superRefine((data, ctx) => {
       if (mode === "view") return;

      if (data.start_time && data.end_time) {
        const start = data.start_time + ":00";
        const end = data.end_time + ":00";

        if (start >= end) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Thời gian kết thúc phải lớn hơn thời gian bắt đầu",
            path: ["end_time"],
          });
        }
      }
    });
}

export type ShiftInput = z.infer<ReturnType<typeof getShiftSchema>>;
export type ShiftSearchInput = z.infer<typeof shiftSearchSchema>;