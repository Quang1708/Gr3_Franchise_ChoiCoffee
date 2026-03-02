import { z } from "zod";

export const clientProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được vượt quá 100 ký tự")
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, "Tên chỉ được chứa chữ cái và khoảng trắng"),

  phone: z
    .string()
    .regex(
      /^(\+84|0)[1-9]\d{8}$/,
      "Số điện thoại phải là số Việt Nam hợp lệ (ví dụ: +84 123 456 789 hoặc 0123456789)",
    ),

  email: z.string().email("Địa chỉ email không hợp lệ").readonly(),

  avatar_url: z.string().url("URL ảnh đại diện không hợp lệ").optional(),
});

export const deactivationRequestSchema = z.object({
  reason: z
    .string()
    .min(10, "Vui lòng cung cấp lý do (ít nhất 10 ký tự)")
    .max(500, "Lý do không được vượt quá 500 ký tự"),

  confirmation: z.string().refine((val) => val === "DEACTIVATE", {
    message: "Vui lòng nhập DEACTIVATE để xác nhận",
  }),

  acknowledge: z.boolean().refine((val) => val === true, {
    message: "Bạn phải xác nhận hiểu hậu quả",
  }),
});

export type ClientProfileFormData = z.infer<typeof clientProfileSchema>;
export type DeactivationRequestFormData = z.infer<
  typeof deactivationRequestSchema
>;

// Re-export from changePassword schema
export {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../../change-password/schema/changePassword.schema";
