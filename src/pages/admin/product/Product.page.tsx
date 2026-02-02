import { useMemo, useState } from "react";
import { Edit2, Trash2, X } from "lucide-react";

import AdminCrudTemplate, { type CrudColumn, type CrudStatCard } from "../../../components/Admin/CRUD.template";
import PRODUCTS from "../../../mocks/Mock.Product";
import { toastError, toastSuccess } from "../../../utils/toast.util";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number | null;
  unit?: string;
  stock?: number;
  badge?: string | null;
  badgeLabel?: string | null;
  image?: string;
  isOutOfStock?: boolean;
  description?: string;
  specifications?: Record<string, string>;
};

type ProductFilters = { category: string };
type ProductForm = Pick<
  Product,
  "id" | "name" | "category" | "price" | "originalPrice" | "unit" | "stock" | "image" | "isOutOfStock"
>;

const MOCK_PRODUCTS: Product[] = PRODUCTS as Product[];

const formatCurrency = (value: number | null) => {
  if (value == null) return "-";
  return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
};

const ProductPage = () => {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProductForm>({
    id: "",
    name: "",
    category: "",
    price: 0,
    originalPrice: null,
    unit: "túi",
    stock: 0,
    image: "",
    isOutOfStock: false,
  });

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category))).sort();
    return ["all", ...cats];
  }, [products]);

  const stats: CrudStatCard[] = useMemo(() => {
    const outOfStock = products.filter((p) => p.isOutOfStock || (p.stock ?? 0) === 0).length;
    const total = products.length;
    return [
      { label: "Tổng sản phẩm", value: total },
      { label: "Hết hàng", value: outOfStock, tone: "danger" },
      { label: "Danh mục", value: Math.max(0, categories.length - 1), tone: "success" },
    ];
  }, [categories.length, products]);

  const columns: CrudColumn<Product>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Sản phẩm",
        width: "320px",
        render: (product) => (
          <div className="flex items-center gap-3">
            <img
              src={product.image}
              alt={product.name}
              className="h-12 w-12 rounded-md object-cover border"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500">#{product.id}</p>
            </div>
          </div>
        ),
      },
      {
        key: "category",
        header: "Danh mục",
        width: "140px",
        render: (product) => <span className="text-sm text-gray-700">{product.category}</span>,
      },
      {
        key: "price",
        header: "Giá",
        align: "right",
        width: "180px",
        render: (product) => (
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>
        ),
      },
      {
        key: "stock",
        header: "Tồn kho",
        align: "center",
        width: "120px",
        render: (product) => (
          <div className="text-sm text-gray-900">
            <span className="font-semibold">{product.stock ?? 0}</span>
            <span className="text-gray-500 text-xs ml-1">{product.unit ?? ""}</span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Trạng thái",
        align: "center",
        width: "120px",
        render: (product) =>
          product.isOutOfStock || product.stock === 0 ? (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 rounded">
              Hết hàng
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded">
              Còn hàng
            </span>
          ),
      },
    ],
    [],
  );

  const resetForm = () => {
    setFormState({
      id: "NEW-" + (products.length + 1).toString().padStart(3, "0"),
      name: "",
      category: categories.find((c) => c !== "all") ?? "",
      price: 0,
      originalPrice: null,
      unit: "túi",
      stock: 0,
      image: "",
      isOutOfStock: false,
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    setModalMode("create");
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setModalMode("edit");
    setEditingId(product.id);
    setFormState({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      unit: product.unit ?? "",
      stock: product.stock ?? 0,
      image: product.image ?? "",
      isOutOfStock: Boolean(product.isOutOfStock || product.stock === 0),
    });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    toastSuccess("Đã xóa sản phẩm");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name.trim() || !formState.category.trim()) {
      toastError("Tên và danh mục là bắt buộc");
      return;
    }
    if (formState.price < 0) {
      toastError("Giá không hợp lệ");
      return;
    }

    const exists = products.some((p) => p.id === formState.id && p.id !== editingId);
    if (exists) {
      toastError("Mã sản phẩm đã tồn tại");
      return;
    }

    if (modalMode === "create") {
      const newProduct: Product = {
        ...formState,
        originalPrice: formState.originalPrice ?? null,
        stock: formState.stock ?? 0,
        unit: formState.unit ?? "",
        image: formState.image ?? "",
        isOutOfStock: formState.isOutOfStock || (formState.stock ?? 0) === 0,
        description: "",
        badge: null,
        badgeLabel: null,
        specifications: {},
      };
      setProducts((prev) => [newProduct, ...prev]);
      toastSuccess("Đã thêm sản phẩm");
    } else if (modalMode === "edit" && editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...formState,
                originalPrice: formState.originalPrice ?? null,
                stock: formState.stock ?? 0,
                unit: formState.unit ?? "",
                image: formState.image ?? "",
                isOutOfStock: formState.isOutOfStock || (formState.stock ?? 0) === 0,
              }
            : p,
        ),
      );
      toastSuccess("Đã cập nhật sản phẩm");
    }

    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="p-6 space-y-6">
      <AdminCrudTemplate<Product, ProductFilters>
        title="Quản lý sản phẩm"
        subtitle="Tổng quản lý sản phẩm"
        addLabel="Thêm sản phẩm"
        onAdd={openCreateModal}
        data={products}
        columns={columns}
        getRowKey={(item) => item.id}
        stats={stats}
        searchKeys={["name", "id"]}
        searchPlaceholder="Tìm theo tên hoặc mã sản phẩm"
        initialFilterState={{ category: "all" }}
        renderFilters={({ filterState, setFilterState }) => (
          <select
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
            value={filterState.category}
            onChange={(e) => setFilterState((prev) => ({ ...prev, category: e.target.value }))}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Tất cả danh mục" : c}
              </option>
            ))}
          </select>
        )}
        filterPredicate={(item, _search, filterState) => {
          if (filterState.category !== "all" && item.category !== filterState.category) return false;
          return true;
        }}
        actions={(product) => (
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => openEditModal(product)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-amber-600 hover:text-amber-600"
              title="Chỉnh sửa"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteProduct(product)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:border-rose-500 hover:text-rose-500"
              title="Xóa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
        emptyState={<span className="text-sm text-gray-500">Không có sản phẩm phù hợp.</span>}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{modalMode === "create" ? "Tạo mới" : "Chỉnh sửa"}</p>
                <h2 className="text-xl font-semibold text-gray-900">
                  {modalMode === "create" ? "Thêm sản phẩm" : "Cập nhật sản phẩm"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-gray-700">Mã sản phẩm</label>
                <input
                  type="text"
                  value={formState.id}
                  onChange={(event) => setFormState((prev) => ({ ...prev, id: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="VD: CF-999"
                  disabled={modalMode === "edit"}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tên sản phẩm</label>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="Tên hiển thị"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Danh mục</label>
                <input
                  type="text"
                  value={formState.category}
                  onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="VD: coffee-beans"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories
                    .filter((c) => c !== "all")
                    .map((c) => (
                      <option key={c} value={c} />
                    ))}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Giá</label>
                  <input
                    type="number"
                    min={0}
                    value={formState.price}
                    onChange={(event) => setFormState((prev) => ({ ...prev, price: Number(event.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Giá gốc</label>
                  <input
                    type="number"
                    min={0}
                    value={formState.originalPrice ?? 0}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, originalPrice: Number(event.target.value) || null }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Đơn vị</label>
                  <input
                    type="text"
                    value={formState.unit}
                    onChange={(event) => setFormState((prev) => ({ ...prev, unit: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                    placeholder="VD: túi"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tồn kho</label>
                  <input
                    type="number"
                    min={0}
                    value={formState.stock}
                    onChange={(event) => setFormState((prev) => ({ ...prev, stock: Number(event.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ảnh (URL)</label>
                <input
                  type="text"
                  value={formState.image}
                  onChange={(event) => setFormState((prev) => ({ ...prev, image: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <input
                  id="isOutOfStock"
                  type="checkbox"
                  checked={formState.isOutOfStock}
                  onChange={(event) => setFormState((prev) => ({ ...prev, isOutOfStock: event.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="isOutOfStock" className="text-sm text-gray-700">
                  Đánh dấu hết hàng
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-amber-700"
                >
                  {modalMode === "create" ? "Thêm" : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
