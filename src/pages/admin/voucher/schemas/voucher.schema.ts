import { z } from "zod";


export const voucherSchema = (mode: "create" | "edit") => {
    return z.object({
        name: mode === "create" || mode === "edit"
            ? z.string().min(1, "Tên voucher là bắt buộc")
            : z.string().optional().or(z.literal("")),

        franchise_id: mode === "create"
            ? z.string().min(1, "Franchise ID là bắt buộc")
            : z.string().optional(),

        type: mode === "create" || mode === "edit"
            ? z.string().min(1, "Loại voucher là bắt buộc")
            : z.string().optional(),

        value: mode === "create" || mode === "edit"
            ? z.coerce.number({
                error: "Giá trị voucher là bắt buộc",
            }).min(1, "Giá trị phải lớn hơn 0")
            : z.coerce.number().optional(),

        quota_total: mode === "create" || mode === "edit"
            ? z.coerce.number({
                error: "Số lượng voucher là bắt buộc",
            }).min(1, "Quota phải lớn hơn 0")
            : z.coerce.number().optional(),

        start_date: mode === "create" || mode === "edit"
            ? z.string().min(1, "Ngày bắt đầu là bắt buộc")
            : z.string().optional(),

        end_date: mode === "create" || mode === "edit"
            ? z.string().min(1, "Ngày kết thúc là bắt buộc")
            : z.string().optional(),
        product_franchise_id: z.string().optional(),
    })
    .refine((data) => {
        // Chỉ check khi có đủ date
        if (data.start_date && data.end_date) {
            return new Date(data.end_date) > new Date(data.start_date);
        }
        return true;
    }, {
        message: "Ngày kết thúc phải sau ngày bắt đầu",
        path: ["end_date"],
    })
    .refine((data) => {
        // Chỉ check khi có value + type
        if (data.type === "PERCENT" && data.value !== undefined) {
            return data.value <= 100;
        }
        return true;
    }, {
        message: "Giá trị % không được vượt quá 100",
        path: ["value"],
    });
};

export type VoucherInput = z.infer<ReturnType<typeof voucherSchema>>;
