import { useMemo, useState } from "react";
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

// ✅ RBAC
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";

const ProductPage = () => {
  const user = useAuthStore((s) => s.user);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);

  const canWrite = useMemo(
    () => can(user, PERM.PRODUCT_WRITE, franchiseId ?? undefined),
    [user, franchiseId],
  );

  const [data, setData] = useState<Product[]>(PRODUCTS);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Create
  const handleAdd = () => {
    if (!canWrite) return;
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (newData: Partial<Product>) => {
    if (!canWrite) return;

    const newId = `PROD-${Math.floor(Math.random() * 10000)}`;

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
    if (!canWrite) return;
    setEditingProduct(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (updatedData: Partial<Product>) => {
    if (!canWrite || !editingProduct) return;

    setData((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...updatedData,
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
    if (!canWrite) return;
    setDeletingProduct(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!canWrite || !deletingProduct) return;

    setData((prev) => prev.filter((p) => p.id !== deletingProduct.id));
    toast.success("Đã xóa sản phẩm");
    setIsDeleteOpen(false);
    setDeletingProduct(null);
  };

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
        // ✅ RBAC: STAFF sẽ không thấy nút Add/Edit/Delete
        onAdd={canWrite ? handleAdd : undefined}
        onEdit={canWrite ? handleEdit : undefined}
        onDelete={canWrite ? handleDelete : undefined}
        searchKeys={["name", "category", "id"]}
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

      {/* ✅ STAFF không render modal write */}
      {canWrite ? (
        <>
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
        </>
      ) : null}
    </div>
  );
};

export default ProductPage;
