import { z } from "zod";

export const ClientVerifyTokenSchema = z.object({
  otp: z
    .string()
    .length(6, "Mã OTP phải có 6 chữ số")
    .regex(/^\d{6}$/, "Mã OTP chỉ bao gồm các chữ số"),
});

export type ClientVerifyTokenSchemaType = z.infer<
  typeof ClientVerifyTokenSchema
>;
