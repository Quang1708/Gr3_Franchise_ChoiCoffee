import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../UI/Modal";
import type { Product } from "../../../models/product.model";
import { Trash2 } from "lucide-react";

// --- Schema ---
const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
  category: z.string().min(1, "Danh mục là bắt buộc"),
  price: z.number({ message: "Giá phải là số" }).min(0, "Giá không được âm"),
  originalPrice: z
    .number()
    .min(0, "Giá gốc không được âm")
    .optional()
    .nullable()
    .or(z.nan()),
  unit: z.string().min(1, "Đơn vị tính là bắt buộc"),
  stock: z
    .number({ message: "Tồn kho phải là số" })
    .int()
    .min(0, "Tồn kho không được âm"),
  image: z
    .string()
    .url("URL hình ảnh không hợp lệ")
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
  isOutOfStock: z.boolean(),
  specifications: z
    .object({
      origin: z.string().optional(),
      material: z.string().optional(),
      warranty: z.string().optional(),
    })
    .optional(),
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
    control,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isOutOfStock: false,
      price: 0,
      stock: 0,
      category: "coffee-beans",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        isOutOfStock: false,
        price: 0,
        stock: 0,
        ...defaultValues,
      });
    }
  }, [defaultValues, reset]);

  // Auto-update status based on stock
  const stockValue = useWatch({ control, name: "stock" });
  useEffect(() => {
    if (stockValue === 0) {
      setValue("isOutOfStock", true);
    } else if (stockValue > 0) {
      setValue("isOutOfStock", false);
    }
  }, [stockValue, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-h-[70vh] overflow-y-auto px-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
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

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Danh mục <span className="text-red-500">*</span>
          </label>
          <select
            {...register("category")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
          >
            <option value="coffee-beans">Cà phê hạt</option>
            <option value="machines">Máy móc</option>
            <option value="tools">Dụng cụ</option>
            <option value="supplies">Vật tư</option>
          </select>
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đơn vị tính <span className="text-red-500">*</span>
          </label>
          <input
            {...register("unit")}
            type="text"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.unit ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
            placeholder="VD: túi, cái..."
          />
          {errors.unit && (
            <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>
          )}
        </div>
      </div>

      {/* Pricing & Stock Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá bán (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            {...register("price", { valueAsNumber: true })}
            type="number"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.price ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
            min="0"
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Original Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Giá gốc (VNĐ)
          </label>
          <input
            {...register("originalPrice", { valueAsNumber: true })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            placeholder="Không bắt buộc"
            min="0"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tồn kho <span className="text-red-500">*</span>
          </label>
          <input
            {...register("stock", { valueAsNumber: true })}
            type="number"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.stock ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
            min="0"
          />
          {errors.stock && (
            <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>
          )}
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL Hình ảnh
        </label>
        <input
          {...register("image")}
          type="text"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all
              ${errors.image ? "border-red-500 bg-red-50" : "border-gray-300"}
            `}
          placeholder="https://example.com/image.jpg"
        />
        {errors.image && (
          <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>
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
          placeholder="Mô tả chi tiết về sản phẩm..."
        />
      </div>

      {/* Basic Specs */}
      <h3 className="text-sm font-medium text-gray-900 pt-2 pb-1 border-b border-gray-100">
        Thông số kỹ thuật (Tùy chọn)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Xuất xứ
          </label>
          <input
            {...register("specifications.origin")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Chất liệu / Bảo hành
          </label>
          <input
            {...register("specifications.material")}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="VD: Thép không gỉ, 12 tháng..."
          />
        </div>
      </div>

      {/* Status (Inversed vs Category: Here Checkbox 'Active' means 'In Stock' usually? 
          User asked for CRUD modals. Let's make it simple: 
          "Hết hàng" Checkbox => if checked, isOutOfStock = true
      */}
      <div className="flex items-center gap-2 pt-2">
        <input
          {...register("isOutOfStock")}
          type="checkbox"
          id="isOutOfStock"
          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
        />
        <label
          htmlFor="isOutOfStock"
          className="text-sm text-gray-700 select-none cursor-pointer"
        >
          Đánh dấu là{" "}
          <span className="font-semibold text-red-600">Đã hết hàng</span>
        </label>
      </div>

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

  // Map specifications correctly
  const defaultValues: Partial<ProductFormData> = {
    ...product,
    specifications: {
      origin: product.specifications?.origin,
      material: product.specifications?.material,
      warranty: product.specifications?.warranty,
    },
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
            Xóa sản phẩm
          </button>
        </div>
      </div>
    </Modal>
  );
};
