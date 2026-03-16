import { z } from "zod";

export const userSearchSchema = z.object({
    keyword: z.string().optional(),
    is_active: z.union([z.boolean(), z.string()]).optional(),
    is_deleted: z.union([z.boolean(), z.string()]).optional(),
    pageNum: z.number(),
    pageSize: z.number(),
})

export const getUserSchema = (mode: "create" | "edit" | "view") => {
    return z.object({
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        email: z.string().email("Email là bắt buộc và phải đúng định dạng"),
        name: z.string().min(1, "Tên là bắt buộc"),
        phone: z.string().min(10, "SĐT là bắt buộc và SĐT không dưới 10 số").max(12, "SĐT không quá 12 số"),
        password: z.string().optional().or(z.literal("")),
        roleCode: z.string().min(1, "Vai trò là bắt buộc"),
        avatar_url: z.string().optional().or(z.literal("")),
    }).refine((data) => {
        if (mode === "create") {
            return data.password && data.password.length >= 6;
        }
        return true;
    }, {
        message: "Mật khẩu là bắt buộc và tối thiểu 6 ký tự khi tạo mới",
        path: ["password"],
    });
}
