import { z } from "zod";

export const AdminAuthSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }).min(1, "Vui lòng nhập email"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const AdminResetPasswordSchema = z.object({
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  confirm: z.string()
}).refine(data => data.password === data.confirm, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirm"],
});

export type AdminAuthSchemaType = z.infer<typeof AdminAuthSchema>;
