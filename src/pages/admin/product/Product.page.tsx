import { useCallback, useEffect, useState } from "react";
import {
  CRUDPageTemplate,
  type Column,
} from "../../../components/Admin/template/CRUDPage.template";
import type { Product } from "../../../models/product.model";
import { toastError, toastSuccess } from "@/utils/toast.util";
import ClientLoading from "@/components/Client/Client.Loading";
import {
  CreateProductModal,
  EditProductModal,
  DeleteProductModal,
  ProductDetailModal,
} from "../../../components/Admin/product/ProductModals";
import {
  createProductUsecase,
  deleteProductUsecase,
  getProductDetailUsecase,
  restoreProductUsecase,
  searchProductsUsecase,
  updateProductUsecase,
} from "./usecases";
import { toProductRow, type ProductRow, type RequestProduct } from "./models";

const ProductPage = () => {
  // --- State ---
  const [data, setData] = useState<ProductRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Loading state for modal operations
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Hàm Fetch ban đầu
  const fetchProducts = useCallback(
    async (pageNum = 1, size?: number) => {
      try {
        setIsTableLoading(true);

        // Delay nhỏ để đảm bảo loading UI hiển thị
        await new Promise(resolve => setTimeout(resolve, 300));

        const searchPayload = {
          searchCondition: {
            keyword: "",
            is_active: "",
            is_deleted: "false",
          },
          pageInfo: {
            pageNum,
            pageSize: size || pageSize,
          },
        };

        console.log("Fetch products payload:", searchPayload);

        const res = await searchProductsUsecase(searchPayload);

        console.log("Fetch products response:", res);

        // Validate response structure
        if (res && typeof res === "object") {
          const productList = res.data || [];
          const paginationInfo = res.pageInfo || {};

          if (Array.isArray(productList)) {
            setData(productList.map(toProductRow));
            setTotalItems(paginationInfo.totalItems || productList.length);
            setCurrentPage(paginationInfo.pageNum || pageNum);
            if (paginationInfo.pageSize) {
              setPageSize(paginationInfo.pageSize);
            }
            console.log(`Loaded ${productList.length} products`);
          } else {
            console.warn("Data is not an array:", productList);
            setData([]);
          }
        } else {
          console.error("Invalid response structure:", res);
          setData([]);
        }
      } catch (error) {
        console.error("Fetch products error:", error);
        setData([]);
        toastError("Không thể tải danh sách sản phẩm");
      } finally {
        setIsTableLoading(false);
      }
    },
    [pageSize]
  );

  const handleSearch = async (keyword: string, filters?: Record<string, string>) => {
    try {
      setIsTableLoading(true);
      setData([]); // Clear previous data while loading

      let isActive: boolean | string = "";
      if (filters?.is_active === "true") {
        isActive = true;
      } else if (filters?.is_active === "false") {
        isActive = false;
      }

      let isDeleted: boolean | string = "";
      if (filters?.is_deleted === "true") {
        isDeleted = true;
      } else if (filters?.is_deleted === "false") {
        isDeleted = false;
      }

      const searchPayload = {
        searchCondition: {
          keyword,
          is_active: isActive,
          is_deleted: isDeleted,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: pageSize,
        },
      };

      console.log("Search payload:", searchPayload);

      const res = await searchProductsUsecase(searchPayload);

      console.log("Search response:", res);

      // Validate response structure
      if (res && typeof res === "object") {
        const productList = res.data || [];
        const paginationInfo = res.pageInfo || {};

        if (Array.isArray(productList) && productList.length > 0) {
          // Data found
          setData(productList.map(toProductRow));
          setTotalItems(paginationInfo.totalItems || productList.length);
          setCurrentPage(1);
          console.log(`Found ${productList.length} products`);
        } else {
          // No data found
          setData([]);
          setTotalItems(0);
          setCurrentPage(1);
          toastError("Không tìm thấy sản phẩm");
        }
      } else {
        console.error("Invalid response format:", res);
        setData([]);
        toastError("Dữ liệu tìm kiếm không hợp lệ");
      }
    } catch (error) {
      console.error("Search error:", error);
      setData([]);
      toastError("Không thể tìm kiếm sản phẩm");
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // --- Handlers ---

  // Create
  const handleAdd = () => {
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (newData: RequestProduct) => {
    if (!newData.SKU || !newData.name) {
      toastError("Thiếu SKU hoặc tên sản phẩm");
      throw new Error("Missing required fields");
    }

    try {
      setIsModalLoading(true);
      const result = await createProductUsecase(newData);

      if (!result.ok) {
        toastError(result.message);
        throw new Error(result.message);
      }

      setData((prev) => [toProductRow(result.product), ...prev]);
      toastSuccess("Thêm sản phẩm thành công");
    } finally {
      setIsModalLoading(false);
    }
  };

  // Edit
  const handleEdit = (item: Product) => {
    setEditingProduct(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (updatedData: RequestProduct) => {
    if (!editingProduct) return;
    if (editingProduct.id === "") {
      toastError("ID sản phẩm không hợp lệ");
      return;
    }

    try {
      setIsModalLoading(true);
      const result = await updateProductUsecase(editingProduct.id, updatedData);

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
    } finally {
      setIsModalLoading(false);
    }
  };

  // Delete
  const handleDelete = (item: Product) => {
    setDeletingProduct(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    if (deletingProduct.id === "") {
      toastError("ID sản phẩm không hợp lệ");
      return;
    }

    try {
      setIsModalLoading(true);
      const result = await deleteProductUsecase(deletingProduct.id);
      if (!result.ok) {
        toastError(result.message);
        return;
      }

      // Keep current list behavior consistent: remove the deleted item from active list immediately.
      await fetchProducts(currentPage, pageSize);
      toastSuccess("Đã xóa sản phẩm");
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleRestore = async (item: Product) => {
    if (item.id === "") {
      toastError("ID sản phẩm không hợp lệ");
      return;
    }

    try {
      setIsModalLoading(true);
      const result = await restoreProductUsecase(item.id);
      if (!result.ok) {
        toastError(result.message);
        return;
      }

      // CRUDPageTemplate currently switches filter before restore request resolves,
      // so fetch again after success to guarantee the restored item appears immediately.
      await fetchProducts(1, pageSize);
      toastSuccess("Đã khôi phục sản phẩm");
    } finally {
      setIsModalLoading(false);
    }
  };

  // View Details
  const handleView = async (item: Product) => {
    try {
      const product = await getProductDetailUsecase(item.id);
      if (product) {
        setViewingProduct(product);
        setIsViewOpen(true);
      } else {
        toastError("Không thể tải chi tiết sản phẩm");
      }
    } catch (error) {
      console.error("View product error:", error);
      toastError("Lỗi khi tải chi tiết sản phẩm");
    }
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
              src={item.image_url || "https://placehold.co/100?text=No+Image"}
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
      accessor: "min_price",
      className: "w-32",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(item.min_price)}
        </span>
      ),
    },
    {
      header: "Giá tối đa",
      accessor: "max_price",
      className: "w-32",
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(item.max_price)}
        </span>
      ),
    },
  ];

  return (
    <>
      {(isTableLoading || isModalLoading) && <ClientLoading />}
      <CRUDPageTemplate<ProductRow>
        title="Quản lý Sản phẩm"
        data={data}
        columns={columns}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={(page) => fetchProducts(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          fetchProducts(1, size);
        }}
        tableMaxHeightClass="max-h-[60vh]"
        filters={[
          {
            key: "is_deleted",
            label: "Trạng thái xóa",
            options: [
              { value: "false", label: "Còn tồn tại" },
              { value: "true", label: "Đã xóa" },
            ],
          },
        ]}
        onAdd={handleAdd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onRefresh={() => fetchProducts(1)}
        onSearch={handleSearch}
        isTableLoading={isTableLoading}
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

      <ProductDetailModal
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewingProduct(null);
        }}
        product={viewingProduct}
      />
      </>
  );
};

export default ProductPage;