import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../UI/Modal";
import type { Product } from "../../../models/product.model";
import { Trash2 } from "lucide-react";

// --- Schema ---
const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  SKU: z.string().min(1, "SKU là bắt buộc"),
  image: z.string().optional(),
  minPrice: z.number({ message: "Giá phải là số" }).min(0, "Giá không được âm"),
  maxPrice: z.number({ message: "Giá phải là số" }).min(0, "Giá không được âm"),
  description: z.string().optional(),
  content: z.string().optional(),
});

type ProductFormData = z.input<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
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
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      minPrice: 0,
      maxPrice: 0,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        minPrice: 0,
        maxPrice: 0,
        ...defaultValues,
      });
    }
  }, [defaultValues, reset]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-h-[70vh] overflow-y-auto px-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
            placeholder="VD: Cà phê Robusta..."
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* SKU */}
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mã SKU <span className="text-red-500">*</span>
          </label>
          <input
            {...register("SKU")}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.SKU ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
            placeholder="VD: CF-001"
          />
          {errors.SKU && (
            <p className="text-red-500 text-xs mt-1">{errors.SKU.message}</p>
          )}
        </div>

        {/* Image URL (New Field) */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL Hình ảnh
          </label>
          <input
            {...register("image")}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Pricing Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Min Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá tối thiểu (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            {...register("minPrice", { valueAsNumber: true })}
            type="number"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.minPrice ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
            min="0"
          />
          {errors.minPrice && (
            <p className="text-red-500 text-xs mt-1">
              {errors.minPrice.message}
            </p>
          )}
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá tối đa (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            {...register("maxPrice", { valueAsNumber: true })}
            type="number"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.maxPrice ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
            min="0"
          />
          {errors.maxPrice && (
            <p className="text-red-500 text-xs mt-1">
              {errors.maxPrice.message}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả ngắn
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
          placeholder="Mô tả sơ lược về sản phẩm..."
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nội dung chi tiết
        </label>
        <textarea
          {...register("content")}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
          placeholder="Nội dung đầy đủ..."
        />
      </div>

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

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Product>) => void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const handleSubmit = (data: ProductFormData) => {
    // Transform formatting if needed
    console.log("Creating Product:", data);
    onSubmit(data as unknown as Partial<Product>);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm sản phẩm mới"
      maxWidth="max-w-xl"
    >
      <ProductForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Thêm mới"
      />
    </Modal>
  );
};

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (data: Partial<Product>) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
}) => {
  if (!product) return null;

  const handleSubmit = (data: ProductFormData) => {
    console.log("Updating Product:", data);
    onSubmit(data as unknown as Partial<Product>);
    onClose();
  };

  // Map product to form data
  const defaultValues: Partial<ProductFormData> = {
    name: product.name,
    SKU: product.SKU,
    image: product.image || "",
    minPrice: product.minPrice,
    maxPrice: product.maxPrice,
    description: product.description || "",
    content: product.content || "",
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh sửa sản phẩm"
      maxWidth="max-w-xl"
    >
      <ProductForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Lưu thay đổi"
      />
    </Modal>
  );
};

interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirm: () => void;
}

export const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm,
}) => {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác nhận xóa"
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h4 className="text-gray-900 font-medium text-lg mb-2">
          Xóa sản phẩm?
        </h4>
        <p className="text-gray-500 text-sm mb-6">
          Bạn đang thực hiện xóa sản phẩm{" "}
          <span className="font-semibold text-gray-800">"{product.name}"</span>.
          Hành động này không thể hoàn tác.
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
            Xóa sản phẩm
          </button>
        </div>
      </div>
    </Modal>
  );
};
