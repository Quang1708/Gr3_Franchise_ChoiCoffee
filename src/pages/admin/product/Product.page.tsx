import { useEffect, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";
import type { Product } from "../../../models/product.model";
import ClientLoading from "@/components/Client/Client.Loading";
import { toastError, toastSuccess } from "@/utils/toast.util";
import {
  CreateProductModal,
  EditProductModal,
  DeleteProductModal,
} from "../../../components/Admin/product/ProductModals";
import {
  createProductUsecase,
  deleteProductUsecase,
  getProductsUsecase,
  restoreProductUsecase,
  searchProductsUsecase,
  updateProductUsecase,
} from "./usecases";
import { toProductRow, type ProductRow } from "./models";

const ProductPage = () => {
  // --- State ---
  const [data, setData] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [filterIsActive, setFilterIsActive] = useState<boolean | string>("");
  const [filterIsDeleted, setFilterIsDeleted] = useState<boolean | string>("false");

  const handleSearch = async (keyword: string, filters?: Record<string, string>) => {
    setIsLoading(true);
    try {
      const isActiveVal = filters?.isActive || filterIsActive;
      const isDeletedVal = filters?.is_deleted || filterIsDeleted;

      let isActive: boolean | string = "";
      if (isActiveVal === "true") {
        isActive = true;
      } else if (isActiveVal === "false") {
        isActive = false;
      }

      const isDeleted = isDeletedVal === "true";

      const payload = {
        searchCondition: {
          keyword,
          is_active: isActive,
          is_deleted: isDeleted,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 200,
        },
      };

      const items = await searchProductsUsecase(payload);
      setData(items.map(toProductRow));
    } catch {
      toastError("Không thể tìm kiếm sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const items = await getProductsUsecase();
        if (!isMounted) return;
        setData(items.map(toProductRow));
      } catch {
        toastError("Không thể tải danh sách sản phẩm");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Handlers ---

  // Create
  const handleAdd = () => {
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (newData: Partial<Product>) => {
    if (!newData.SKU || !newData.name) {
      toastError("Thiếu SKU hoặc tên sản phẩm");
      throw new Error("Missing required fields");
    }

    const result = await createProductUsecase({
      SKU: newData.SKU,
      name: newData.name,
      img: newData.img,
      description: newData.description,
      content: newData.content,
      minPrice: newData.minPrice ?? 0,
      maxPrice: newData.maxPrice ?? 0,
      isActive: newData.isActive ?? true,
    });

    if (!result.ok) {
      toastError(result.message);
      throw new Error(result.message);
    }

    setData((prev) => [toProductRow(result.product), ...prev]);
    toastSuccess("Thêm sản phẩm thành công");
  };

  // Edit
  const handleEdit = (item: Product) => {
    setEditingProduct(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (updatedData: Partial<Product>) => {
    if (!editingProduct) return;
    if (editingProduct.id === 0 || editingProduct.id === "") {
      toastError("ID sản phẩm không hợp lệ");
      return;
    }

    const result = await updateProductUsecase(editingProduct.id, {
      SKU: updatedData.SKU,
      name: updatedData.name,
      img: updatedData.img,
      description: updatedData.description,
      content: updatedData.content,
      minPrice: updatedData.minPrice,
      maxPrice: updatedData.maxPrice,
      isActive: updatedData.isActive,
    });

    if (!result.ok) {
      toastError(result.message);
      throw new Error(result.message);
    }

    setData((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id ? toProductRow(result.product) : p,
      ),
    );
    toastSuccess("Cập nhật sản phẩm thành công");
  };

  // Delete
  const handleDelete = (item: Product) => {
    setDeletingProduct(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    if (deletingProduct.id === 0 || deletingProduct.id === "") {
      toastError("ID sản phẩm không hợp lệ");
      return;
    }

    const result = await deleteProductUsecase(deletingProduct.id);
    if (!result.ok) {
      toastError(result.message);
      return;
    }

    setData((prev) =>
      prev.map((p) =>
        p.id === deletingProduct.id
          ? { ...p, is_deleted: true, isDeleted: true }
          : p,
      ),
    );
    toastSuccess("Đã xóa sản phẩm");
  };

  const handleRestore = async (item: Product) => {
    if (item.id === 0 || item.id === "") {
      toastError("ID sản phẩm không hợp lệ");
      return;
    }

    const result = await restoreProductUsecase(item.id);
    if (!result.ok) {
      toastError(result.message);
      return;
    }

    setData((prev) =>
      prev.map((p) =>
        p.id === item.id ? { ...p, is_deleted: false, isDeleted: false } : p,
      ),
    );
    toastSuccess("Đã khôi phục sản phẩm");
  };

  const handleStatusChange = async (item: Product, newStatus: boolean) => {
    if (item.id === 0 || item.id === "") {
      toastError("ID sản phẩm không hợp lệ");
      return;
    }
    const prevStatus = item.isActive;
    const prevUpdatedAt = item.updatedAt;
    const nextUpdatedAt = new Date().toISOString();

    setData((prev) =>
      prev.map((p) =>
        p.id === item.id
          ? { ...p, isActive: newStatus, updatedAt: nextUpdatedAt }
          : p,
      ),
    );

    const result = await updateProductUsecase(item.id, { isActive: newStatus });
    if (!result.ok) {
      setData((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? { ...p, isActive: prevStatus, updatedAt: prevUpdatedAt }
            : p,
        ),
      );
      toastError(result.message);
      return;
    }

    toastSuccess(
      `Đã cập nhật trạng thái: ${newStatus ? "Hoạt động" : "Ngưng hoạt động"}`,
    );
  };

  // --- Configuration ---
  const columns: Column<ProductRow>[] = [
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
              src={item.img || "https://placehold.co/100?text=No+Image"}
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
      header: "Ngày tạo",
      accessor: (item) => new Date(item.createdAt).toLocaleDateString("vi-VN"),
      sortable: true,
      className: "text-gray-500 text-sm",
    },
    {
      header: "Ngày cập nhật",
      accessor: (item) => new Date(item.updatedAt).toLocaleDateString("vi-VN"),
      sortable: true,
      className: "text-gray-500 text-sm",
    },
  ];

  return (
    <div className="p-6 h-[calc(100vh-4rem)] min-h-0 flex flex-col overflow-hidden transition-all animate-fade-in">
      {isLoading ? <ClientLoading /> : null}
      <CRUDTable<ProductRow>
        title="Quản lý Sản phẩm"
        data={data}
        columns={columns}
        pageSize={5}
        tableMaxHeightClass="max-h-[60vh]"
        // Actions
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        // Status
        statusField="isActive"
        onStatusChange={handleStatusChange}
        deferToolsApply
        // Search & Filter
        searchKeys={["name", "SKU"]}
        onSearch={(keyword: string, filters?: Record<string, string>) => {
          const isActiveFilter = filters?.isActive || "";
          const isDeletedFilter = filters?.is_deleted || "false";
          setFilterIsActive(isActiveFilter);
          setFilterIsDeleted(isDeletedFilter);
          handleSearch(keyword, { isActive: isActiveFilter, is_deleted: isDeletedFilter });
        }}
        filters={[
          {
            key: "isActive",
            label: "Trạng thái",
            options: [
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" },
            ],
          },
          {
            key: "is_deleted",
            label: "Trạng thái xóa",
            options: [
              { value: "false", label: "Còn tồn tại" },
              { value: "true", label: "Đã xóa" },
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