import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PersonalInformationProps } from "../types/profile.types";
import { Edit3, Lock } from "lucide-react";
import FormInput from "@/components/Client/Form/FormInput";
import {
  editProfileSchema,
  type EditProfileFormData,
} from "../schema/clientProfile.schema";

export default function PersonalInformation({
  profile,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: PersonalInformationProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    mode: "onChange",
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone,
      address: profile.address || "",
    },
  });

  // Reset form when profile changes or when switching to edit mode
  useEffect(() => {
    reset({
      name: profile.name,
      phone: profile.phone,
      address: profile.address || "",
    });
  }, [profile, reset]);

  const onSubmit = async (data: EditProfileFormData) => {
    await onSave(data);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Thông tin cá nhân
          </h2>
          <div>
            {!isEditing ? (
              <button
                type="button"
                onClick={onEdit}
                className="px-6 py-2 bg-primary hover:bg-[#d17d0f] text-white font-medium rounded-lg transition-colors duration-200"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-[#d17d0f] text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {isEditing ? (
            <>
              <FormInput
                label="Họ và tên"
                type="text"
                placeholder="Nhập họ và tên"
                register={register("name")}
                error={errors.name}
                inputClassName="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                labelClassName="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              />

              <FormInput
                label="Số điện thoại"
                type="tel"
                placeholder="Nhập số điện thoại"
                register={register("phone")}
                error={errors.phone}
                inputClassName="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                labelClassName="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  {...register("address")}
                  rows={3}
                  placeholder="Nhập địa chỉ"
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors resize-none"
                />
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Họ và tên
                </label>
                <div className="relative group">
                  <div className="px-4 py-2.5 border border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between">
                    <p className="text-gray-900 dark:text-white">
                      {profile.name}
                    </p>
                    <Edit3 className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Số điện thoại
                </label>
                <div className="relative group">
                  <div className="px-4 py-2.5 border border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-between">
                    <p className="text-gray-900 dark:text-white">
                      {profile.phone}
                    </p>
                    <Edit3 className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Địa chỉ
                </label>
                <div className="relative group">
                  <div className="px-4 py-2.5 border border-primary/30 rounded-lg bg-primary/5 dark:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer flex items-start justify-between min-h-11">
                    <p className="text-gray-900 dark:text-white flex-1">
                      {profile.address || "Chưa cập nhật"}
                    </p>
                    <Edit3 className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors mt-0.5" />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Địa chỉ Email
            </label>
            <div className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                {profile.email || "Chưa cập nhật"}
              </p>
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
