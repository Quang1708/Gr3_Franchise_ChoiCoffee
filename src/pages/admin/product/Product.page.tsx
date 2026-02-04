import { useState } from "react";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import PRODUCTS from "../../../mocks/Mock.Product";
import type { Product } from "../../../models/product.model";
import { toast } from "sonner";
import {
  CreateProductModal,
  EditProductModal,
  DeleteProductModal,
} from "../../../components/Admin/product/ProductModals";

const ProductPage = () => {
  // --- State ---
  const [data, setData] = useState<Product[]>(PRODUCTS);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // --- Handlers ---

  // Create
  const handleAdd = () => {
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (newData: Partial<Product>) => {
    // Generate simple mock ID
    const newId = `PROD-${Math.floor(Math.random() * 10000)}`;

    const product: Product = {
      id: newId,
      name: newData.name!,
      category: newData.category || "coffee-beans",
      price: newData.price || 0,
      originalPrice: newData.originalPrice || null,
      unit: newData.unit || "unit",
      stock: newData.stock || 0,
      badge: null,
      image: newData.image || "",
      isOutOfStock: newData.isOutOfStock || false,
      description: newData.description,
      specifications: newData.specifications,
    };

    setData((prev) => [product, ...prev]);
    toast.success("Thêm sản phẩm thành công");
    setIsCreateOpen(false);
  };

  // Edit
  const handleEdit = (item: Product) => {
    setEditingProduct(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (updatedData: Partial<Product>) => {
    if (!editingProduct) return;

    setData((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...updatedData,
              // Ensure specs are merged correctly if needed, or just replaced
              specifications: {
                ...p.specifications,
                ...updatedData.specifications,
              },
            }
          : p,
      ),
    );

    toast.success("Cập nhật sản phẩm thành công");
    setIsEditOpen(false);
    setEditingProduct(null);
  };

  // Delete
  const handleDelete = (item: Product) => {
    setDeletingProduct(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingProduct) return;

    setData((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    toast.success("Đã xóa sản phẩm");
    setIsDeleteOpen(false);
    setDeletingProduct(null);
  };

  // --- Configuration ---
  const columns: Column<Product>[] = [
    {
      header: "Sản phẩm",
      accessor: "name",
      className: "min-w-[300px]",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/100?text=No+Image";
              }}
            />
          </div>
          <div>
            <div className="font-medium text-gray-900 line-clamp-1">
              {item.name}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="uppercase tracking-wider font-semibold text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">
                {item.id}
              </span>
              <span>{item.category}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Giá bán",
      accessor: "price",
      sortable: true,
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-primary">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(item.price)}
          </span>
          {item.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(item.originalPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Tồn kho",
      accessor: "stock",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1">
          <span
            className={`font-medium ${
              item.stock === 0 ? "text-red-500" : "text-gray-700"
            }`}
          >
            {item.stock}
          </span>
          <span className="text-xs text-gray-500">{item.unit}</span>
        </div>
      ),
    },
    {
      header: "Phân loại",
      accessor: "category",
      className: "hidden md:table-cell text-gray-500 capitalize",
    },
    {
      header: "Trạng thái",
      accessor: "isOutOfStock",
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
            !item.isOutOfStock
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {!item.isOutOfStock ? "Còn hàng" : "Hết hàng"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 transition-all animate-fade-in">
      <CRUDTable<Product>
        title="Quản lý Sản phẩm"
        data={data}
        columns={columns}
        pageSize={5}
        // Actions
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        // Search & Filter
        searchKeys={["name", "category", "id"]}
        filters={[
          {
            key: "category",
            label: "Danh mục",
            options: [
              { value: "coffee-beans", label: "Cà phê hạt" },
              { value: "machines", label: "Máy móc" },
              { value: "tools", label: "Dụng cụ" },
              { value: "supplies", label: "Vật tư" },
            ],
          },
          {
            key: "isOutOfStock",
            label: "Trạng thái",
            options: [
              { value: "false", label: "Còn hàng" },
              { value: "true", label: "Hết hàng" },
            ],
          },
        ]}
      />

      {/* --- Modals --- */}
      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSubmit={handleEditSubmit}
      />

      <DeleteProductModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingProduct(null);
        }}
        product={deletingProduct}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProductPage;
