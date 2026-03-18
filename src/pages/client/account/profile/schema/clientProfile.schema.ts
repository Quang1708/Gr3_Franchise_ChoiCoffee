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

  email: z
    .string()
    .min(1, "Email không được để trống")
    .email("Địa chỉ email không đúng định dạng"),

  address: z
    .string()
    .max(500, "Địa chỉ không được quá 500 ký tự")
    .optional()
    .or(z.literal("")),

  avatar_url: z.string().url("URL ảnh đại diện không hợp lệ").optional(),
});

export type ClientProfileFormData = z.infer<typeof clientProfileSchema>;

// Schema for editing profile (only editable fields)
export const editProfileSchema = clientProfileSchema.pick({
  name: true,
  email: true,
  phone: true,
  address: true,
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

// Re-export from changePassword schema
export {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "../../change-password/schema/changePassword.schema";
