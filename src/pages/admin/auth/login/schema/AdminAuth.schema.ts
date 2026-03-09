import { z } from "zod";

export const AdminAuthSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ")
    .trim(),

  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export const AdminResetPasswordSchema = z
  .object({
    old_password: z
      .string()
      .min(8, "Mật khẩu hiện tại phải tối thiểu 8 ký tự"),

    new_password: z
      .string()
      .min(8, "Mật khẩu mới phải tối thiểu 8 ký tự"),

    confirm: z.string(),
  })
  .refine((data) => data.new_password === data.confirm, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirm"],
  });

export type AdminResetPasswordSchemaType = z.infer<
  typeof AdminResetPasswordSchema
>;
