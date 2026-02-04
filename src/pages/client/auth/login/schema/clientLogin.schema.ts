import { z } from "zod";

export const ClientLoginSchema = z.object({
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
    ),
  rememberMe: z.boolean().optional(),
});

export type ClientLoginSchemaType = z.infer<typeof ClientLoginSchema>;
