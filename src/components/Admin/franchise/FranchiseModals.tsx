import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../UI/Modal";
import type { Franchise } from "../../../models/franchise.model";
import { AlertTriangle } from "lucide-react";

// --- Schema ---
const franchiseSchema = z.object({
  code: z.string().min(1, "Mã chi nhánh là bắt buộc").max(50, "Mã quá dài"),
  name: z.string().min(1, "Tên chi nhánh là bắt buộc"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  openedAt: z.string().min(1, "Giờ mở cửa là bắt buộc"),
  closedAt: z.string().optional().or(z.literal("")),
  isActive: z.boolean(),
});

type FranchiseFormData = z.infer<typeof franchiseSchema>;

interface FranchiseFormProps {
  defaultValues?: Partial<FranchiseFormData>;
  onSubmit: (data: FranchiseFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel: string;
}

const FranchiseForm: React.FC<FranchiseFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FranchiseFormData>({
    resolver: zodResolver(franchiseSchema),
    defaultValues: {
      ...defaultValues,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        isActive: defaultValues?.isActive ?? true,
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mã chi nhánh <span className="text-red-500">*</span>
        </label>
        <input
          {...register("code")}
          type="text"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
            ${errors.code ? "border-red-500 bg-red-50" : "border-gray-300"}
          `}
          placeholder="VD: FR-HCM-001"
        />
        {errors.code && (
          <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên chi nhánh <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
            ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"}
          `}
          placeholder="VD: Quận 1 - Nguyễn Huệ"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("address")}
          rows={2}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none
            ${errors.address ? "border-red-500 bg-red-50" : "border-gray-300"}
          `}
          placeholder="VD: 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
        />
        {errors.address && (
          <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
        )}
      </div>

      {/* Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mở cửa (ISO/time) <span className="text-red-500">*</span>
          </label>
          <input
            {...register("openedAt")}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.openedAt ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
            placeholder="VD: 2023-01-15T08:00:00Z hoặc 08:00"
          />
          {errors.openedAt && (
            <p className="text-red-500 text-xs mt-1">
              {errors.openedAt.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đóng cửa (ISO/time)
          </label>
          <input
            {...register("closedAt")}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.closedAt ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
            placeholder="VD: 22:00"
          />
          {errors.closedAt && (
            <p className="text-red-500 text-xs mt-1">
              {errors.closedAt.message}
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <input
          {...register("isActive")}
          type="checkbox"
          id="isActive"
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Đang hoạt động
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

// --- Create Modal ---
export const CreateFranchiseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FranchiseFormData) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm chi nhánh"
      description="Nhập thông tin chi nhánh mới"
      size="md"
    >
      <FranchiseForm
        submitLabel="Tạo mới"
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

// --- Edit Modal ---
export const EditFranchiseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  onSubmit: (data: FranchiseFormData) => void;
}> = ({ isOpen, onClose, franchise, onSubmit }) => {
  if (!franchise) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật chi nhánh"
      description={`Chỉnh sửa: ${franchise.name}`}
      size="md"
    >
      <FranchiseForm
        defaultValues={{
          code: franchise.code,
          name: franchise.name,
          address: franchise.address,
          openedAt: franchise.openedAt,
          closedAt: franchise.closedAt ?? "",
          isActive: franchise.isActive,
        }}
        submitLabel="Lưu"
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

// --- Delete Modal ---
export const DeleteFranchiseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  onConfirm: () => void;
}> = ({ isOpen, onClose, franchise, onConfirm }) => {
  if (!franchise) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xóa chi nhánh" size="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Bạn chắc chắn muốn xóa chi nhánh này?
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">{franchise.name}</span> (
              {franchise.code})
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Thao tác này không thể hoàn tác.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Xóa
          </button>
        </div>
      </div>
    </Modal>
  );
};
