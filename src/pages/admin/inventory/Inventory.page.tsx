import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  CRUDTable,
  type Column,
} from "@/components/Admin/template/CRUD.template";

import { PRODUCT_SEED_DATA } from "@/mocks/product.seed";
import { PRODUCT_FRANCHISE_SEED_DATA } from "@/mocks/product_franchise.seed";
import { INVENTORY_SEED_DATA } from "@/mocks/inventory.seed";

import {
  UpdateInventoryModal,
  LowStockHint,
} from "@/components/Admin/inventory/InventoryModals";

import { useAdminContextStore } from "@/stores/adminContext.store";
import { useAuthStore } from "@/stores/auth.store";
import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";

type InventoryRowVM = {
  id: number;
  productFranchiseId: number;

  productName: string;
  sku: string;
  size: number;

  quantity: number;
  alertThreshold: number;
  isActive: boolean;
  updatedAt: string;

  lowStock: boolean;
};

const Pill = ({
  text,
  tone = "neutral",
}: {
  text: string;
  tone?: "neutral" | "success" | "danger" | "warning";
}) => {
  const map: Record<string, string> = {
    neutral: "bg-gray-50 text-gray-700 border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${map[tone]} whitespace-nowrap`}
    >
      {text}
    </span>
  );
};

const InventoryPage = () => {
  const user = useAuthStore((s) => s.user);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);

  // mock state để update UI
  const [inventoryData, setInventoryData] = useState(INVENTORY_SEED_DATA);
  const [lowOnly, setLowOnly] = useState(false);

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<InventoryRowVM | null>(null);

  const canUpdate = useMemo(
    () => can(user, PERM.INVENTORY_UPDATE, franchiseId ?? undefined),
    [user, franchiseId],
  );

  const rows: InventoryRowVM[] = useMemo(() => {
    if (!franchiseId) return [];

    const pfList = PRODUCT_FRANCHISE_SEED_DATA.filter(
      (pf) => pf.franchiseId === franchiseId && !pf.isDeleted,
    );

    const invByPfId = new Map(
      inventoryData
        .filter((i) => !i.isDeleted)
        .map((i) => [i.productFranchiseId, i]),
    );

    const vm = pfList.map((pf) => {
      const product = PRODUCT_SEED_DATA.find((p) => p.id === pf.productId);
      const inv = invByPfId.get(pf.id);
      const quantity = Number(inv?.quantity ?? 0);
      const alertThreshold = Number(inv?.alertThreshold ?? 0);
      const lowStock = quantity <= alertThreshold;

      return {
        id: inv?.id ?? pf.id,
        productFranchiseId: pf.id,
        productName: product?.name ?? `Product#${pf.productId}`,
        sku: (product as any)?.SKU ?? (product as any)?.sku ?? "-",
        size: pf.size,
        quantity,
        alertThreshold,
        isActive: Boolean(inv?.isActive ?? true),
        updatedAt: inv?.updatedAt ?? new Date().toISOString(),
        lowStock,
      };
    });

    const filtered = lowOnly ? vm.filter((x) => x.lowStock) : vm;
    return filtered.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [franchiseId, inventoryData, lowOnly]);

  const hasLowStock = useMemo(() => rows.some((r) => r.lowStock), [rows]);

  const columns: Column<InventoryRowVM>[] = useMemo(
    () => [
      {
        header: "Sản phẩm",
        accessor: (r) => (
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {r.productName}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <Pill text={`SKU: ${r.sku}`} />
              <Pill text={`Size: ${r.size}`} />
              {r.lowStock ? <Pill text="LOW" tone="warning" /> : null}
            </div>
          </div>
        ),
      },
      {
        header: "Số lượng",
        accessor: (r) => (
          <div className="flex items-center gap-2">
            <span
              className={
                r.lowStock ? "text-rose-700 font-semibold" : "text-gray-900"
              }
            >
              {Number(r.quantity).toLocaleString("vi-VN")}
            </span>
            <span className="text-xs text-gray-500">
              / {Number(r.alertThreshold).toLocaleString("vi-VN")}
            </span>
          </div>
        ),
        sortable: true,
      },
      {
        header: "Trạng thái",
        accessor: (r) => (
          <Pill
            text={r.isActive ? "AVAILABLE" : "OUT_OF_STOCK"}
            tone={r.isActive ? "success" : "danger"}
          />
        ),
      },
      {
        header: "Cập nhật",
        accessor: (r) => new Date(r.updatedAt).toLocaleString("vi-VN"),
        sortable: true,
      },
      {
        header: "Hành động",
        accessor: (r) => (
          <button
            type="button"
            onClick={() => {
              setSelectedRow(r);
              setIsUpdateOpen(true);
            }}
            disabled={!canUpdate}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
              canUpdate
                ? "bg-primary text-white hover:opacity-90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Cập nhật
          </button>
        ),
      },
    ],
    [canUpdate],
  );

  const handleUpdate = (payload: {
    quantity: number;
    alertThreshold: number;
    isActive: boolean;
  }) => {
    if (!selectedRow) return;

    setInventoryData((prev) => {
      const idx = prev.findIndex(
        (x) =>
          x.productFranchiseId === selectedRow.productFranchiseId &&
          !x.isDeleted,
      );
      const now = new Date().toISOString();

      if (idx === -1) {
        const nextId = Math.max(0, ...prev.map((x) => x.id)) + 1;
        return [
          {
            id: nextId,
            productFranchiseId: selectedRow.productFranchiseId,
            quantity: payload.quantity,
            alertThreshold: payload.alertThreshold,
            isActive: payload.isActive,
            isDeleted: false,
            createdAt: now,
            updatedAt: now,
          } as any,
          ...prev,
        ];
      }

      const copy = [...prev];
      copy[idx] = {
        ...copy[idx],
        quantity: payload.quantity,
        alertThreshold: payload.alertThreshold,
        isActive: payload.isActive,
        updatedAt: now,
      };
      return copy;
    });

    toast.success("Cập nhật tồn kho thành công");
    setIsUpdateOpen(false);
    setSelectedRow(null);
  };

  const isEmpty = rows.length === 0;

  return (
    <div className="h-full p-4 md:p-6 flex flex-col gap-3">
      {hasLowStock && !lowOnly ? (
        <LowStockHint text="Có mặt hàng sắp hết. Bấm “Lọc: Low” để xem nhanh." />
      ) : null}

      {/* Table area: fill còn lại, không scroll toàn trang */}
      <div className="flex-1 min-h-0">
        <div className="h-full bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="h-full overflow-auto">
            <CRUDTable<InventoryRowVM>
              title="Danh sách tồn kho"
              data={rows}
              columns={columns}
              pageSize={8}
              onAdd={undefined}
              onEdit={undefined}
              onDelete={undefined}
              searchKeys={["productName" as any, "sku" as any]}
              statusField={"isActive" as any as keyof InventoryRowVM}
              onStatusChange={(row) => {
                if (!canUpdate) return;
                setSelectedRow(row);
                setIsUpdateOpen(true);
              }}
              // ✅ Nút Low Stock nằm cạnh Search
              searchRightSlot={
                <button
                  type="button"
                  onClick={() => setLowOnly((v) => !v)}
                  className={`h-9 px-3 rounded-lg border text-sm font-semibold transition whitespace-nowrap ${
                    lowOnly
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {lowOnly ? "Đang lọc: Low" : "Lọc: Low"}
                </button>
              }
            />

            {isEmpty ? (
              <div className="p-6 text-sm text-gray-600">
                Không có dữ liệu tồn kho cho chi nhánh này.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <UpdateInventoryModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedRow(null);
        }}
        title={canUpdate ? "Cập nhật tồn kho" : "Xem tồn kho"}
        subtitle={
          selectedRow
            ? `${selectedRow.productName} • SKU ${selectedRow.sku} • Size ${selectedRow.size}`
            : ""
        }
        defaultValues={{
          quantity: selectedRow?.quantity ?? 0,
          alertThreshold: selectedRow?.alertThreshold ?? 0,
          isActive: selectedRow?.isActive ?? true,
        }}
        onSubmit={handleUpdate}
        readOnly={!canUpdate}
      />
    </div>
  );
};

export default InventoryPage;
