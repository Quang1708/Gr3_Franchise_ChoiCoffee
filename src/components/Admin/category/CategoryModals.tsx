import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../UI/Modal";
import type { Category } from "../../../models/category.model";
import { AlertTriangle } from "lucide-react";

// --- Schema ---
const categorySchema = z.object({
  code: z.string().min(1, "Mã danh mục là bắt buộc").max(50, "Mã quá dài"),
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// --- Shared Form Component ---
interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel: string;
  hideStatus?: boolean; // New prop to optionally hide the status field
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
  hideStatus,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      ...defaultValues,
      is_active: defaultValues?.is_active ?? true,
    },
  });

  // Reset form when defaultValues change (important for Edit mode)
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        is_active: defaultValues?.is_active ?? true,
      });
    }
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mã danh mục <span className="text-red-500">*</span>
        </label>
        <input
          {...register("code")}
          type="text"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
            ${errors.code ? "border-red-500 bg-red-50" : "border-gray-300"}
          `}
          placeholder="VD: CATE01"
        />
        {errors.code && (
          <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên danh mục <span className="text-red-500">*</span>
        </label>
        <input
          {...register("name")}
          type="text"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
            ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"}
          `}
          placeholder="VD: Cà phê hạt"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
          placeholder="Mô tả chi tiết về danh mục..."
        />
      </div>

      {/* Status */}
      {/* Status - only show if not hidden */}
      {!hideStatus && (
        <div className="flex items-center gap-2">
          <input
            {...register("is_active")}
            type="checkbox"
            id="is_active"
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label
            htmlFor="is_active"
            className="text-sm text-gray-700 select-none cursor-pointer"
          >
            Đang hoạt động
          </label>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Đang xử lý...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
};

// --- Modals ---

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Category>) => void;
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = (data: CategoryFormData) => {
    // Simulate API call
    console.log("Creating:", data);
    onSubmit(data as unknown as Partial<Category>);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm danh mục mới">
      <CategoryForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Thêm mới"
        hideStatus // Hide status field for Create modal
      />
    </Modal>
  );
};

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSubmit: (data: Partial<Category>) => void;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
}) => {
  if (!category) return null;

  const handleSubmit = (data: CategoryFormData) => {
    // Simulate API call
    console.log("Updating:", data);
    onSubmit(data as unknown as Partial<Category>);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa danh mục">
      <CategoryForm
        defaultValues={{
          code: category.code,
          name: category.name,
          description: category.description,
          is_active: category.is_active,
        }}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Lưu thay đổi"
      />
    </Modal>
  );
};

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onConfirm: () => void;
}

export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onConfirm,
}) => {
  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa"
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h4 className="text-gray-900 font-medium text-lg mb-2">
          Bạn có chắc chắn?
        </h4>
        <p className="text-gray-500 text-sm mb-6">
          Bạn đang thực hiện xóa danh mục{" "}
          <span className="font-semibold text-gray-800">"{category.name}"</span>
          . Hành động này không thể hoàn tác.
        </p>

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Xóa danh mục
          </button>
        </div>
      </div>
    </Modal>
  );
};
