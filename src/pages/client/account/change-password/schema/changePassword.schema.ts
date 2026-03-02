import { z } from "zod";

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(8, "Mật khẩu hiện tại là bắt buộc")
      .max(100, "Mật khẩu quá dài"),

    new_password: z
      .string()
      .min(8, "Mật khẩu mới phải có ít nhất 8 ký tự")
      .max(100, "Mật khẩu không được vượt quá 100 ký tự")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một số",
      ),

    confirm_password: z.string().min(8, "Vui lòng xác nhận mật khẩu của bạn"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Mật khẩu không khớp",
    path: ["confirm_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "Mật khẩu mới phải khác mật khẩu hiện tại",
    path: ["new_password"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
