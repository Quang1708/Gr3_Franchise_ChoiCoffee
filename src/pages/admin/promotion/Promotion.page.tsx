import { useCallback, useEffect, useMemo, useState } from "react";
import { CRUDTable, type Column } from "@/components/Admin/template/CRUD.template";
import ClientLoading from "@/components/Client/Client.Loading";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  createPromotionService,
  deletePromotionService,
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
  const [error, setError] = useState<string | null>(null);
  const [productOptions, setProductOptions] = useState<ProductFranchise[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedItem, setSelectedItem] = useState<PromotionRow | null>(null);

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

  const fetchData = useCallback(async () => {
    if (!franchiseId && !isGlobalAdmin) {
      setList([]);
      return;
    }

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

    try {
      await Promise.resolve(); // avoid sync setState in effect callsites
      setIsLoading(true);
      setError(null);

      const promoRes = await searchPromotionsService(
        isGlobalAdmin ? undefined : franchiseId,
      );

      // product options chỉ cần cho create (theo franchise đang chọn/đăng nhập)
      if (createFranchiseId) {
        try {
          const pfRes = await searchProductFranchisesService(createFranchiseId);
          setProductOptions(pfRes.data ?? []);
        } catch {
          setProductOptions([]);
        }
      } else {
        setProductOptions([]);
      }

      const franchiseNameById = new Map(
        (franchises ?? []).map((f) => [String(f.id), f.name]),
      );

      const items = promoRes?.data ?? [];
      const rows: PromotionRow[] = items
        .filter((p) => p && p.is_deleted !== true)
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
          };
        });

      setList(rows);
      console.log(`Gọi API OK`);
    } catch {
      setError("Không thể tải danh sách promotion");
      setList([]);
      toastError("Gọi API promotions thất bại");
    } finally {
      setIsLoading(false);
    }
  }, [franchiseId, isGlobalAdmin, createFranchiseId, franchises]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

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
    if (!window.confirm(`Xóa promotion id=${item.id}?`)) return;
    void (async () => {
      try {
        await deletePromotionService(item.id);
      } catch {
        // ignore - still do optimistic UI
      } finally {
        setList((prev) => prev.filter((x) => x.id !== item.id));
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

  const isFormLoading = isCreating || isUpdating;

  return (
    <>
      {isFormLoading && <ClientLoading />}

      <div className="p-6 transition-all animate-fade-in">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Promotion</h1>
        </div>

        {isLoading ? (
          <div>Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <CRUDTable<PromotionRow>
            title="Danh sách promotion"
            data={list}
            columns={columns}
            pageSize={10}
            onAdd={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchKeys={
              isGlobalAdmin
                ? ([
                    "name",
                    "franchise_name",
                    "product",
                    "type",
                    "value",
                    "start_date",
                    "end_date",
                  ] as (keyof PromotionRow)[])
                : ([
                    "name",
                    "product",
                    "type",
                    "value",
                    "start_date",
                    "end_date",
                  ] as (keyof PromotionRow)[])
            }
          />
        )}

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
      </div>
    </>
  );
};

export default PromotionPage;

