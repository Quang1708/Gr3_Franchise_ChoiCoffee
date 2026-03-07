import { z } from "zod";

export const ClientResendTokenSchema = z.object({
  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Email không hợp lệ"),
});

export type ClientResendTokenSchemaType = z.infer<
  typeof ClientResendTokenSchema
>;
