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
    }).refine((data) => {
        if (mode === "create") {
            data.start_time = data.start_time + ":00"; // Thêm giây mặc định
            data.end_time = data.end_time + ":00"; // Thêm giây mặc định
            return data.start_time < data.end_time; // Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc
        }
        if (mode === "edit") {
            if (data.start_time && data.end_time) {
                data.start_time = data.start_time + ":00";
                data.end_time = data.end_time + ":00";
                return data.start_time < data.end_time;
            }
            return true; // Nếu không cập nhật thời gian, bỏ qua validation này
        }
        return true; // Ở chế độ view, bỏ qua validation này
        }, {
            message: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc",
            path: ["start_time", "end_time"],
    });
}

export type ShiftInput = z.infer<ReturnType<typeof getShiftSchema>>;
export type ShiftSearchInput = z.infer<typeof shiftSearchSchema>;