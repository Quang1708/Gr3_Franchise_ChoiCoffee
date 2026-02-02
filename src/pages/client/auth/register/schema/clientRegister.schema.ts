import { z } from "zod";

export const ClientRegisterSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(/^(0|\+84)[0-9]{9}$/, "Số điện thoại không hợp lệ"),
  email: z
    .string()
    .email({ message: "Email không hợp lệ" })
    .min(1, "Vui lòng nhập email"),
  region: z.string().min(1, "Vui lòng chọn khu vực quan tâm"),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
});

export type ClientRegisterSchemaType = z.infer<typeof ClientRegisterSchema>;
