import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/UI/Modal";
import { toastSuccess, toastError } from "@/utils/toast.util";
import { changePassword } from "../partial/service/customerAuth05.service";
import { customerLogout } from "../../auth/services/customerAuth06.service";
import FormInput from "@/components/Client/Form/FormInput";
import ROUTER_URL from "@/routes/router.const";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "./schema/changePassword.schema";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const errorMap: Record<string, string> = {
    "Your old password is not valid!": "Mật khẩu hiện tại không đúng!",
  };

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);

    try {
      await changePassword({
        old_password: data.current_password,
        new_password: data.new_password,
      });

      toastSuccess("Đổi mật khẩu thành công! Đang đăng xuất...");
      handleClose();

      // Logout after password change
      try {
        await customerLogout();
      } catch {
        // Ignore logout error, proceed anyway
      }

      // Clear customer info from localStorage
      localStorage.removeItem("customer_info");

      // Navigate to login page after a short delay
      navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN);
    } catch (error: unknown) {
      const err = error as { message?: string };
      const errorMessage =
        errorMap[err.message || ""] ||
        "Đổi mật khẩu thất bại. Vui lòng thử lại";

      setError("current_password", {
        type: "server",
        message: errorMessage,
      });
      console.log(err.message);
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đổi mật khẩu"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Current Password */}
        <FormInput
          label="Mật khẩu hiện tại *"
          type="password"
          placeholder="Nhập mật khẩu hiện tại"
          error={errors.current_password}
          register={register("current_password")}
          showPasswordToggle={true}
          labelClassName="block text-sm font-medium text-gray-700 mb-2"
          inputClassName="block w-full px-4 py-2.5 border border-primary rounded-lg hover:border-primary/80 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
        />

        {/* New Password */}
        <div>
          <FormInput
            label="Mật khẩu mới *"
            type="password"
            placeholder="Nhập mật khẩu mới"
            error={errors.new_password}
            register={register("new_password")}
            showPasswordToggle={true}
            labelClassName="block text-sm font-medium text-gray-700 mb-2"
            inputClassName="block w-full px-4 py-2.5 border border-primary rounded-lg hover:border-primary/80 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
          </p>
        </div>

        {/* Confirm Password */}
        <FormInput
          label="Xác nhận mật khẩu mới *"
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          error={errors.confirm_password}
          register={register("confirm_password")}
          showPasswordToggle={true}
          labelClassName="block text-sm font-medium text-gray-700 mb-2"
          inputClassName="block w-full px-4 py-2.5 border border-primary rounded-lg hover:border-primary/80 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
        />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 border border-primary text-primary rounded-lg hover:bg-primary/10 hover:cursor-pointer font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-wood-brown hover:cursor-pointer font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Đang xử lý..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
