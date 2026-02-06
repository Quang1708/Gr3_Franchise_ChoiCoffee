import { useState } from "react";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import { PRODUCT_SEED_DATA } from "../../../mocks/product.seed";
import type { Product } from "../../../models/product.model";
import { toast } from "sonner";
import {
  CreateProductModal,
  EditProductModal,
  DeleteProductModal,
} from "../../../components/Admin/product/ProductModals";

const ProductPage = () => {
  // --- State ---
  const [data, setData] = useState<Product[]>(PRODUCT_SEED_DATA);

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
    const nextId = data.length > 0 ? Math.max(...data.map((p) => p.id)) + 1 : 1;

    const product: Product = {
      id: nextId,
      SKU: newData.SKU || `PROD-${nextId}`,
      name: newData.name!,
      image: newData.image || "",
      description: newData.description,
      content: newData.content,
      minPrice: newData.minPrice || 0,
      maxPrice: newData.maxPrice || 0,
      isActive: newData.isActive ?? true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
              updatedAt: new Date().toISOString(),
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

  const handleStatusChange = (item: Product, newStatus: boolean) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === item.id
          ? { ...p, isActive: newStatus, updatedAt: new Date().toISOString() }
          : p,
      ),
    );
    toast.success(
      `Đã cập nhật trạng thái: ${newStatus ? "Hoạt động" : "Ngưng hoạt động"}`,
    );
  };

  // --- Configuration ---
  const columns: Column<Product>[] = [
    {
      header: "SKU",
      accessor: "SKU",
      sortable: true,
      className: "w-24 font-mono text-xs text-gray-500",
    },
    {
      header: "Sản phẩm",
      accessor: "name",
      className: "min-w-[250px]",
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
            <img
              src={item.image || "https://placehold.co/100?text=No+Image"}
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
          </div>
        </div>
      ),
    },
    {
      header: "Giá tối thiểu",
      accessor: "minPrice",
      className: "w-32",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(item.minPrice)}
        </span>
      ),
    },
    {
      header: "Giá tối đa",
      accessor: "maxPrice",
      className: "w-32",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(item.maxPrice)}
        </span>
      ),
    },
    {
      header: "Mô tả",
      accessor: "description",
      className: "min-w-[200px] max-w-xs",
      render: (item) => (
        <p className="text-sm text-gray-500 truncate" title={item.description}>
          {item.description || "---"}
        </p>
      ),
    },
    {
      header: "Ngày cập nhật",
      accessor: (item) => new Date(item.updatedAt).toLocaleDateString("vi-VN"),
      sortable: true,
      className: "text-gray-500 text-sm",
    },
  ];

  return (
    <div className="p-6 h-auto max-h-[calc(100vh-4rem)] flex flex-col transition-all animate-fade-in">
      <CRUDTable<Product>
        title="Quản lý Sản phẩm"
        data={data}
        columns={columns}
        pageSize={5}
        // Actions
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        // Status
        statusField="isActive"
        onStatusChange={handleStatusChange}
        // Search & Filter
        searchKeys={["name", "SKU"]}
        filters={[
          {
            key: "isActive",
            label: "Trạng thái",
            options: [
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" },
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
