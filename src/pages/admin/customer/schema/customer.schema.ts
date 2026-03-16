import { z } from "zod";

export const customerSearchSchema = z.object({
    keyword: z.string().optional(),
    isActive: z.union([z.boolean(), z.string()]).optional(),
    pageNum: z.number(),
    pageSize: z.number(),
})

export const getCustomerSchema = (mode: "create" | "edit" | "view") => {
    return z.object({
        email: z.string().email("Email là bắt buộc và phải đúng định dạng"),
        name: z.string().optional().or(z.literal("")),
        phone: z.string().min(10, "SĐT là bắt buộc và SĐT không dưới 10 số").max(12, "SĐT không quá 12 số"),
        // Password: Cho phép rỗng ở mức độ Type
        password: z.string().optional().or(z.literal("")),
        address: z.string().optional().or(z.literal("")),
        avatar_url: z.string().optional().or(z.literal("")),
    }).refine((data) => {
        // IF-ELSE BÁO LỖI Ở ĐÂY:
        if (mode === "create") {
            // Khi tạo mới: Bắt buộc có pass và >= 6 ký tự
            return data.password && data.password.length >= 6;
        }
        // Khi Edit: Cho qua hết
        return true;
    }, {
        message: "Mật khẩu là bắt buộc và tối thiểu 6 ký tự khi tạo mới",
        path: ["password"], // Chỉ định lỗi hiện ở ô password
    });
};

export type CustomerInput = z.infer<typeof getCustomerSchema>;
export type CustomerSearchInput = z.infer<typeof customerSearchSchema>;