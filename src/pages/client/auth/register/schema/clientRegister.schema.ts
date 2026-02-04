import { z } from "zod";

export const ClientRegisterSchema = z
  .object({
    fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
    phone: z
      .string()
      .min(1, "Vui lòng nhập số điện thoại")
      .refine(
        (val) => !val || /^(0|\+84)[0-9]{9}$/.test(val),
        "Số điện thoại không hợp lệ",
      ),
    email: z
      .string()
      .min(1, "Vui lòng nhập email")
      .refine(
        (val) => !val || z.string().email().safeParse(val).success,
        "Email không hợp lệ",
      ),
    password: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu")
      .refine(
        (val) => !val || val.length >= 6,
        "Mật khẩu phải có ít nhất 6 ký tự",
      )
      .refine(
        (val) => !val || val.length < 6 || /[a-z]/.test(val),
        "Mật khẩu phải chứa ít nhất một chữ thường",
      )
      .refine(
        (val) => !val || val.length < 6 || /[A-Z]/.test(val),
        "Mật khẩu phải chứa ít nhất một chữ hoa",
      )
      .refine(
        (val) => !val || val.length < 6 || /[!@#$%^&*(),.?":{}|<>]/.test(val),
        "Mật khẩu phải chứa ít nhất một ký tự đặc biệt",
      ),
    confirmPassword: z.string().min(1, "Vui lòng nhập xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ClientRegisterSchemaType = z.infer<typeof ClientRegisterSchema>;
