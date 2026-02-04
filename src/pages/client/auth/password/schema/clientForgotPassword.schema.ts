import { z } from "zod";

export const ClientForgotPasswordSchema = z.object({
  email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ"),
});

export type ClientForgotPasswordSchemaType = z.infer<
  typeof ClientForgotPasswordSchema
>;
