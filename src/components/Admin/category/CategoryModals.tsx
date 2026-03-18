import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "@/components/UI/Modal";
import type { Category, CategorySelectItem } from "@/models/category.model";
import { AlertTriangle, RotateCcw } from "lucide-react";

// --- Schema ---
const categorySchema = z.object({
  code: z.string().min(1, "Mã danh mục là bắt buộc").max(50, "Mã quá dài"),
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  description: z.string().optional(),
  parent_id: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^[a-fA-F0-9]{24}$/.test(value),
    ),
  is_active: z.boolean(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// --- Shared Form Component ---
interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel: string;
  hideStatus?: boolean; 
  parentOptions?: CategorySelectItem[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
  hideStatus,
  parentOptions,
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
      parent_id:
        defaultValues?.parent_id != null
          ? String(defaultValues.parent_id)
          : "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  // Reset form when defaultValues change (important for Edit mode)
  useEffect(() => {
    if (defaultValues) {
      reset({
        ...defaultValues,
        parent_id:
          defaultValues?.parent_id != null
            ? String(defaultValues.parent_id)
            : "",
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
          placeholder="Mã danh mục"
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
          placeholder="Tên danh mục"
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

      {/* Parent */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Danh mục cha
        </label>
        {parentOptions && parentOptions.length > 0 ? (
          <select
            {...register("parent_id")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
          >
            <option value="">-- Không có --</option>
            {parentOptions.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {option.name} ({option.code})
              </option>
            ))}
          </select>
        ) : (
          <input
            {...register("parent_id")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="VD: 64f1c2a9b5e3d0c2a1f9e0ab"
          />
        )}
        <p className="text-xs text-gray-500 mt-1">
          Bỏ trống nếu không có danh mục cha.
        </p>
        {errors.parent_id && (
          <p className="text-red-500 text-xs mt-1">
            {errors.parent_id.message}
          </p>
        )}
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
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
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
  onSubmit: (data: CategoryFormData) => void;
  isLoading?: boolean;
  parentOptions?: CategorySelectItem[];
}

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  parentOptions,
}) => {
  const handleSubmit = (data: CategoryFormData) => {
    // Simulate API call
    console.log("Creating:", data);
    onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm danh mục mới">
      <CategoryForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Thêm mới"
        hideStatus // Hide status field for Create modal
        isLoading={isLoading}
        parentOptions={parentOptions}
      />
    </Modal>
  );
};

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSubmit: (data: CategoryFormData) => void;
  isLoading?: boolean;
  parentOptions?: CategorySelectItem[];
}

interface ViewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  parentOptions?: CategorySelectItem[];
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
  isLoading,
  parentOptions,
}) => {
  if (!category) return null;

  const handleSubmit = (data: CategoryFormData) => {
    // Simulate API call
    console.log("Updating:", data);
    onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chỉnh sửa danh mục">
      <CategoryForm
        defaultValues={{
          code: category.code,
          name: category.name,
          description: category.description,
          parent_id:
            category.parent_id != null ? String(category.parent_id) : "",
          is_active: category.is_active,
        }}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Lưu thay đổi"
        isLoading={isLoading}
        parentOptions={parentOptions}
      />
    </Modal>
  );
};

export const ViewCategoryModal: React.FC<ViewCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  parentOptions,
}) => {
  if (!category) return null;

  const parentId =
    category.parent_id && category.parent_id !== "undefined"
      ? String(category.parent_id)
      : "";
  const parentMatch = parentOptions?.find(
    (option) => String(option.value) === parentId,
  );
  const parentLabel = parentMatch
    ? `${parentMatch.name} (${parentMatch.code})`
    : parentId || "";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết danh mục">
      <div className="space-y-3 text-sm text-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Mã danh mục</span>
          <span className="font-medium text-gray-900">{category.code}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Tên danh mục</span>
          <span className="font-medium text-gray-900">{category.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Danh mục cha</span>
          <span className="font-medium text-gray-900">{parentLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Trạng thái</span>
          <span className="font-medium text-gray-900">
            {category.is_active ? "Hoạt động" : "Ngưng hoạt động"}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Mô tả</span>
          <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
            {category.description || "Không có mô tả"}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <span className="text-gray-500">Ngày tạo</span>
            <div className="mt-1 text-gray-900">
              {new Date(category.created_at).toLocaleString("vi-VN")}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Ngày cập nhật</span>
            <div className="mt-1 text-gray-900">
              {new Date(category.updated_at).toLocaleString("vi-VN")}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
        >
          Đóng
        </button>
      </div>
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
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 cursor-pointer"
          >
            Xóa danh mục
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface RestoreCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const RestoreCategoryModal: React.FC<RestoreCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onConfirm,
  isLoading,
}) => {
  if (!category) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận khôi phục"
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <RotateCcw className="w-6 h-6 text-emerald-600" />
        </div>
        <h4 className="text-gray-900 font-medium text-lg mb-2">
          Khôi phục danh mục?
        </h4>
        <p className="text-sm text-gray-600 mb-6">
          Danh mục <span className="font-semibold">{category.name}</span> sẽ
          được khôi phục và hiển thị lại trong hệ thống.
        </p>
        <div className="flex justify-center gap-3 w-full">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            type="button"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            Khôi phục
          </button>
        </div>
      </div>
    </Modal>
  );
};
