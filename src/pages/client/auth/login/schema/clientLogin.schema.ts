import { z } from "zod";

export const ClientLoginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  rememberMe: z.boolean().optional(),
});

export type ClientLoginSchemaType = z.infer<typeof ClientLoginSchema>;
