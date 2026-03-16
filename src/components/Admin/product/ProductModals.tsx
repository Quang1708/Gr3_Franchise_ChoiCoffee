import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../UI/Modal";
import type { RequestProduct } from "../../../pages/admin/product/models";
import type { Product } from "@/models/product.model";
import { Trash2 } from "lucide-react";
import { FormInput } from "@/components/Admin/Form/FormInput";

// --- Schema ---
const productSchema = z
  .object({
    name: z.string().min(1, "Tên sản phẩm là bắt buộc"),
    SKU: z.string().min(1, "SKU là bắt buộc"),
    image: z.string().optional(),
    minPrice: z
      .number({ message: "Giá phải là số" })
      .min(0, "Giá không được âm"),
    maxPrice: z
      .number({ message: "Giá phải là số" })
      .min(0, "Giá không được âm"),
    description: z.string().optional(),
    content: z.string().optional(),
  })
  .refine((v) => v.maxPrice >= v.minPrice, {
    path: ["maxPrice"],
    message: "Giá tối đa phải lớn hơn hoặc bằng giá tối thiểu",
  });

type ProductFormData = z.input<typeof productSchema>;

const toProductPartial = (data: ProductFormData): RequestProduct => ({
  name: data.name,
  SKU: data.SKU,
  img: data.image,
  minPrice: data.minPrice,
  maxPrice: data.maxPrice,
  description: data.description,
  content: data.content,
});

const submitProductForm = async (
  data: ProductFormData,
  opts: {
    setIsLoading: (value: boolean) => void;
    onSubmit: (data: Partial<Product>) => Promise<void> | void;
    onClose: () => void;
  },
) => {
  opts.setIsLoading(true);
  try {
    await opts.onSubmit(toProductPartial(data));
    opts.onClose();
  } catch {
    // handled by caller (toast), keep modal open
  } finally {
    opts.setIsLoading(false);
  }
};

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
    setValue,
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
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-1">
          <label
            htmlFor="product-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tên sản phẩm <span className="text-red-500">*</span>
          </label>
          <input
            id="product-name"
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
          <label
            htmlFor="product-sku"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mã SKU <span className="text-red-500">*</span>
          </label>
          <input
            id="product-sku"
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

        {/* Image Upload */}
        <div className="md:col-span-2 flex items-center justify-center">
          <FormInput
            label=""
            type="file"
            defaultValue={defaultValues?.image}
            register={register("image")}
            onUploadSuccess={(url) => setValue("image", url)}
            uploadFolder="products"
          />
        </div>
      </div>

      {/* Pricing Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Min Price */}
        <div>
          <label
            htmlFor="product-min-price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Giá tối thiểu (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            id="product-min-price"
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
          <label
            htmlFor="product-max-price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Giá tối đa (VNĐ) <span className="text-red-500">*</span>
          </label>
          <input
            id="product-max-price"
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
        <label
          htmlFor="product-description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mô tả ngắn
        </label>
        <textarea
          id="product-description"
          {...register("description")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
          placeholder="Mô tả sơ lược về sản phẩm..."
        />
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor="product-content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nội dung chi tiết
        </label>
        <textarea
          id="product-content"
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
  onSubmit: (data: RequestProduct) => Promise<void> | void;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (data: ProductFormData) =>
    submitProductForm(data, { setIsLoading, onSubmit, onClose });

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
        isLoading={isLoading}
        submitLabel="Thêm mới"
      />
    </Modal>
  );
};

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (data: RequestProduct) => Promise<void> | void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  if (!product) return null;

  const handleSubmit = (data: ProductFormData) =>
    submitProductForm(data, { setIsLoading, onSubmit, onClose });

  // Map product to form data
  const defaultValues: Partial<ProductFormData> = {
    name: product.name,
    SKU: product.SKU,
    image: product.image_url || "",
    minPrice: product.min_price,
    maxPrice: product.max_price,
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
        isLoading={isLoading}
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

// --- Product Detail Modal ---
interface ProductDetailModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  product,
  onClose,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết sản phẩm">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {product && (
          <>
            {/* Image */}
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={
                    product.image_url ||
                    "https://placehold.co/400?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400?text=No+Image";
                  }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <div className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                  {product.SKU}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm
                </label>
                <div className="text-sm text-gray-900 font-medium">
                  {product.name}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá tối thiểu
                </label>
                <div className="text-sm text-gray-900 font-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.min_price || 0)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá tối đa
                </label>
                <div className="text-sm text-gray-900 font-medium">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(product.max_price || 0)}
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded line-clamp-3">
                  {product.description}
                </div>
              </div>
            )}

            {/* Content */}
            {product.content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nội dung
                </label>
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto line-clamp-4">
                  {product.content}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <div className="text-sm">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      product.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.is_active ? "Hoạt động" : "Ngưng hoạt động"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Xóa mềm
                </label>
                <div className="text-sm">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      product.is_deleted
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {product.is_deleted ? "Đã xóa" : "Còn tồn tại"}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-6 border-t pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
};
