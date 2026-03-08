import { z } from "zod";

export const AdminAuthSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email({ message: "Email không hợp lệ" }),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export type AdminAuthSchemaType = z.infer<typeof AdminAuthSchema>;
