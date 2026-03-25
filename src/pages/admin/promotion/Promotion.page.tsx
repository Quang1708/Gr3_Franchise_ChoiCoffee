import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import ClientLoading from "@/components/Client/Client.Loading";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  createPromotionService,
  deletePromotionService,
  restorePromotionService,
  searchPromotionsServiceByKeyword,
  searchPromotionsService,
  updatePromotionService,
  type PromotionApiItem,
} from "@/services/promotion.service";
import { searchProductFranchisesService } from "@/pages/admin/product_category_franchise/services/searchProductFranchises.service";
import { toastError, toastSuccess } from "@/utils/toast.util";
import type { ProductFranchise } from "@/models/product_franchise.model";
import {
  PromotionForm,
  type PromotionFormInitialData,
  type PromotionFormValues,
} from "./components/PromotionForm";

type PromotionRow = {
  id: string;
  name: string;
  franchise_name?: string;
  product: string;
  product_franchise_id?: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  start_raw?: string | null;
  end_raw?: string | null;
  start_date: string;
  end_date: string;
  is_deleted?: boolean;
};

const formatDateTime = (value?: string) => {
  if (!value) return "--";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const PromotionPage = () => {
  const { selectedFranchiseId, franchises } = useAdminContextStore();
  const user = useAuthStore((s) => s.user);
  const [list, setList] = useState<PromotionRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<ProductFranchise[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<PromotionRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromotionRow | null>(null);
  const searchSeqRef = useRef(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isGlobalAdmin = useMemo(() => {
    return (
      user?.roles?.some(
        (r) =>
          (r.role_code === "ADMIN" || r.role === "ADMIN") && r.scope === "GLOBAL",
      ) ?? false
    );
  }, [user?.roles]);

  const franchiseId = useMemo(() => {
    if (selectedFranchiseId) return String(selectedFranchiseId);
    const rid = user?.roles?.find((r) => r.franchise_id)?.franchise_id;
    return rid ? String(rid) : "";
  }, [selectedFranchiseId, user?.roles]);

  const createFranchiseId = useMemo(() => {
    if (isGlobalAdmin) return selectedFranchiseId ? String(selectedFranchiseId) : "";
    return franchiseId;
  }, [isGlobalAdmin, selectedFranchiseId, franchiseId]);

  const mapPromotionsToRows = useCallback(
    (items: PromotionApiItem[]): PromotionRow[] => {
      const toType = (raw: PromotionApiItem["type"]): "PERCENT" | "FIXED" =>
        String(raw ?? "PERCENT").toUpperCase() === "FIXED" ? "FIXED" : "PERCENT";

      const toNumber = (raw: unknown): number => {
        if (typeof raw === "number" && Number.isFinite(raw)) return raw;
        if (typeof raw === "string") {
          const n = Number(raw);
          if (Number.isFinite(n)) return n;
        }
        return 0;
      };

      const franchiseNameById = new Map(
        (franchises ?? []).map((f) => [String(f.id), f.name]),
      );

      return items
        .filter((p) => !!p)
        .map((p) => {
          const pfId = p.product_franchise_id ? String(p.product_franchise_id) : "";
          const product =
            p.product_name && String(p.product_name).trim()
              ? String(p.product_name)
              : pfId
                ? pfId
                : "Toàn Sản Phẩm";

          return {
            id: String(p.id),
            name: String(p.name ?? `Promotion ${p.id}`),
            franchise_name: isGlobalAdmin
              ? String(
                  p.franchise_name ??
                    franchiseNameById.get(String(p.franchise_id ?? "")) ??
                    p.franchise_id ??
                    "",
                )
              : undefined,
            product,
            product_franchise_id: p.product_franchise_id ?? null,
            type: toType(p.type),
            value: toNumber(p.value),
            start_raw: p.start_date ?? null,
            end_raw: p.end_date ?? null,
            start_date: formatDateTime(p.start_date ?? undefined),
            end_date: formatDateTime(p.end_date ?? undefined),
            is_deleted: Boolean(p.is_deleted),
          };
        });
    },
    [franchises, isGlobalAdmin],
  );

  const fetchData = useCallback(async () => {
    if (!franchiseId && !isGlobalAdmin) {
      setList([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const promoRes = await searchPromotionsService(
        isGlobalAdmin ? undefined : franchiseId,
      );
      setList(mapPromotionsToRows(promoRes?.data ?? []));
      setCurrentPage(1);
    } catch {
      setError("Không thể tải danh sách promotion");
      setList([]);
      toastError("Gọi API promotions thất bại");
    } finally {
      setIsLoading(false);
    }
  }, [franchiseId, isGlobalAdmin, mapPromotionsToRows]);

  const fetchProductOptions = useCallback(async () => {
    if (!createFranchiseId) {
      setProductOptions([]);
      return;
    }
    try {
      const pfRes = await searchProductFranchisesService(createFranchiseId);
      setProductOptions(pfRes.data ?? []);
    } catch {
      setProductOptions([]);
    }
  }, [createFranchiseId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    void fetchProductOptions();
  }, [fetchProductOptions]);

  const handleSearch = useCallback(
    async (
      keyword: string,
      filters?: Partial<Record<keyof PromotionRow, string>>,
    ) => {
      const seq = ++searchSeqRef.current;
      try {
        setIsLoading(true);
        setError(null);
        const isDeleted = filters?.is_deleted === "true";
        const type =
          filters?.type === "PERCENT" || filters?.type === "FIXED"
            ? filters.type
            : "";

        const trimmedKeyword = keyword.trim();

        // Try 1: call backend with keyword (in case backend supports it)
        const promoRes = await searchPromotionsServiceByKeyword(
          isGlobalAdmin ? undefined : franchiseId,
          trimmedKeyword,
          { isDeleted, type },
        );

        if (seq !== searchSeqRef.current) return; // ignore stale responses

        let items = promoRes?.data ?? [];

        // Try 2: backend may not filter by keyword correctly -> fallback:
        // call again with keyword="" (only keep other filters), then filter in frontend.
        if (trimmedKeyword && items.length === 0) {
          const fallbackRes = await searchPromotionsServiceByKeyword(
            isGlobalAdmin ? undefined : franchiseId,
            "",
            { isDeleted, type },
          );

          if (seq !== searchSeqRef.current) return; // ignore stale responses

          items = fallbackRes?.data ?? [];
        }

        let rows = mapPromotionsToRows(items);

        if (trimmedKeyword) {
          const normalizedKeyword = trimmedKeyword.toLowerCase();
          rows = rows.filter((row) => {
            const bucket = [
              row.name,
              row.franchise_name ?? "",
              row.product,
              row.type,
              String(row.value),
              row.start_date,
              row.end_date,
            ]
              .join(" ")
              .toLowerCase();
            return bucket.includes(normalizedKeyword);
          });
        }

        setList(rows);
        setCurrentPage(1);
      } catch {
        if (seq === searchSeqRef.current) {
          setError("Không thể tìm kiếm danh sách promotion");
          setList([]);
          toastError("Gọi API promotions search thất bại");
        }
      } finally {
        if (seq === searchSeqRef.current) {
          setIsLoading(false);
        }
      }
    },
    [franchiseId, isGlobalAdmin, mapPromotionsToRows],
  );

  const handleCreate = () => {
    if (isGlobalAdmin && !createFranchiseId) {
      toastError("Admin cần chọn Franchise context trước khi tạo promotion");
      return;
    }
    setFormMode("create");
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleEdit = (item: PromotionRow) => {
    setFormMode("edit");
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const buildUtcIso = (date: string, time: string, fallbackTime: string) => {
    const d = date?.trim();
    const t = (time?.trim() || fallbackTime).slice(0, 5);
    return `${d}T${t}:00.000Z`;
  };

  const handleSubmitCreate = async (data: PromotionFormValues) => {
    if (isCreating) return;
    if (!createFranchiseId) {
      toastError("Không xác định được franchise_id");
      return;
    }

    const valueNum = Number(data.value);
    const productFranchiseId =
      data.product_franchise_id === "ALL" || !data.product_franchise_id
        ? null
        : String(data.product_franchise_id);

    try {
      setIsCreating(true);
      await createPromotionService({
        name: data.name.trim(),
        franchise_id: String(createFranchiseId),
        product_franchise_id: productFranchiseId,
        type: data.type,
        value: Number.isFinite(valueNum) ? valueNum : 0,
        start_date: buildUtcIso(data.start_date, data.start_time, "00:00"),
        end_date: buildUtcIso(data.end_date, data.end_time, "23:59"),
      });
      console.log("Tạo promotion thành công");
      setIsFormOpen(false);
      await fetchData();
    } catch {
      console.log("Tạo promotion thất bại");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSubmitEdit = async (data: PromotionFormValues) => {
    if (isUpdating) return;
    if (!selectedItem) return;

    const valueNum = Number(data.value);

    try {
      setIsUpdating(true);
      await updatePromotionService(selectedItem.id, {
        name: data.name.trim(),
        type: data.type,
        value: Number.isFinite(valueNum) ? valueNum : 0,
        start_date: buildUtcIso(data.start_date, data.start_time, "00:00"),
        end_date: buildUtcIso(data.end_date, data.end_time, "23:59"),
      });
      console.log("Cập nhật promotion thành công");
      setIsFormOpen(false);
      setSelectedItem(null);
      await fetchData();
    } catch {
      console.log("Cập nhật promotion thất bại");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (item: PromotionRow) => {
    setDeleteTarget(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    void (async () => {
      try {
        setIsDeleting(true);
        await deletePromotionService(deleteTarget.id);
        setList((prev) =>
          prev.map((x) =>
            x.id === deleteTarget.id
              ? {
                  ...x,
                  is_deleted: true,
                }
              : x,
          ),
        );
        toastSuccess("Đã xóa promotion");
      } catch {
        toastError("Xóa promotion thất bại");
      } finally {
        setIsDeleting(false);
        setDeleteTarget(null);
      }
    })();
  };

  const handleRestore = (item: PromotionRow) => {
    void (async () => {
      try {
        setIsRestoring(true);
        await restorePromotionService(item.id);
        setList((prev) =>
          prev.map((x) =>
            x.id === item.id
              ? {
                  ...x,
                  is_deleted: false,
                }
              : x,
          ),
        );
        toastSuccess("Đã khôi phục promotion");
      } catch {
        toastError("Khôi phục promotion thất bại");
      } finally {
        setIsRestoring(false);
      }
    })();
  };

  const columns: Column<PromotionRow>[] = useMemo(
    () => [
      { header: "Name", accessor: "name", className: "min-w-[180px]", sortable: true },
      ...(isGlobalAdmin
        ? ([
            {
              header: "Franchise name",
              accessor: "franchise_name",
              className: "min-w-[180px]",
              sortable: true,
              render: (it) => it.franchise_name || "--",
            },
          ] as Column<PromotionRow>[])
        : []),
      { header: "Product", accessor: "product", className: "min-w-[140px]" },
      {
        header: "Type",
        accessor: "type",
        render: (it) => (it.type === "PERCENT" ? "PERCENT" : "FIXED"),
      },
      {
        header: "Value",
        accessor: "value",
        sortable: true,
        render: (it) =>
          it.type === "PERCENT"
            ? `${it.value}%`
            : `${it.value.toLocaleString("vi-VN")}₫`,
      },
      { header: "start_date", accessor: "start_date" },
      { header: "end_date", accessor: "end_date" },
    ],
    [isGlobalAdmin],
  );

  const isFormLoading = isCreating || isUpdating || isDeleting || isRestoring;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [currentPage, list, pageSize]);

  if (isLoading && list.length === 0) {
    return <ClientLoading />;
  }

  return (
    <>
      {isFormLoading && <ClientLoading />}

      <div className="p-6 transition-all animate-fade-in h-full">
        {error ? <div className="text-red-500 mb-4">{error}</div> : null}

        <CRUDPageTemplate<PromotionRow>
          title="Quản lý Promotion"
          data={paginatedData}
          columns={columns}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={list.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          tableMaxHeightClass="max-h-[60vh]"
          onAdd={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onSearch={handleSearch}
          onRefresh={fetchData}
          filters={[
            {
              key: "type",
              label: "Loại",
              options: [
                { value: "PERCENT", label: "PERCENT" },
                { value: "FIXED", label: "FIXED" },
              ],
            },
            {
              key: "is_deleted",
              label: "Còn tồn tại",
              options: [
                { value: "false", label: "Còn tồn tại" },
                { value: "true", label: "Đã xóa" },
              ],
            },
          ]}
          isTableLoading={isLoading}
        />

        <PromotionForm
          isOpen={isFormOpen}
          mode={formMode}
          isLoading={formMode === "create" ? isCreating : isUpdating}
          productOptions={productOptions}
          onClose={() => setIsFormOpen(false)}
          onSubmit={formMode === "create" ? handleSubmitCreate : handleSubmitEdit}
          initialData={
            formMode === "edit" && selectedItem
              ? ({
                  name: selectedItem.name,
                  product_franchise_id: selectedItem.product_franchise_id ?? null,
                  type: selectedItem.type,
                  value: selectedItem.value,
                  start_date: selectedItem.start_raw ?? null,
                  end_date: selectedItem.end_raw ?? null,
                } satisfies PromotionFormInitialData)
              : undefined
          }
        />

        {deleteTarget ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
              <div className="border-b border-gray-100 px-5 py-4">
                <h3 className="text-base font-semibold text-gray-900">
                  Xác nhận xóa promotion
                </h3>
              </div>
              <div className="px-5 py-4 text-sm text-gray-600">
                Bạn có chắc muốn xóa promotion{" "}
                <span className="font-medium text-gray-900">
                  "{deleteTarget.name}"
                </span>{" "}
                không?
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default PromotionPage;

