import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CRUDTable,
  type Column,
} from "../../../components/Admin/template/CRUD.template";

import { FRANCHISE_SEED_DATA } from "../../../mocks/franchise.seed";
import { PRODUCT_SEED_DATA } from "../../../mocks/product.seed";
import { PRODUCT_FRANCHISE_SEED_DATA } from "../../../mocks/product_franchise.seed";
import { INVENTORY_SEED_DATA } from "../../../mocks/inventory.seed";

import {
  UpdateInventoryModal,
  LowStockHint,
} from "../../../components/Admin/inventory/InventoryModals";

type InventoryRowVM = {
  id: number;
  franchiseId: number;

  productFranchiseId: number;
  productName: string;
  sku: string;
  size: number;

  quantity: number;
  alertThreshold: number;
  isActive: boolean; // AVAILABLE/OUT_OF_STOCK (theo db: is_active)
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
  // local state (mock) để update UI đồng bộ
  const [inventoryData, setInventoryData] = useState(INVENTORY_SEED_DATA);

  // đồng bộ theo franchise: chọn franchiseId
  const [franchiseId, setFranchiseId] = useState<number>(() => {
    const first = FRANCHISE_SEED_DATA.find((f) => !f.isDeleted)?.id;
    return first ?? 1;
  });

  // filter: low stock only
  const [lowOnly, setLowOnly] = useState(false);

  // modal update
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<InventoryRowVM | null>(null);

  const franchiseOptions = useMemo(
    () =>
      FRANCHISE_SEED_DATA.filter((f) => !f.isDeleted).map((f) => ({
        id: f.id,
        label: `${f.code} — ${f.name}`,
      })),
    [],
  );

  const rows: InventoryRowVM[] = useMemo(() => {
    // product_franchise theo franchise
    const pfList = PRODUCT_FRANCHISE_SEED_DATA.filter(
      (pf) => pf.franchiseId === franchiseId && !pf.isDeleted,
    );

    // map product_franchise_id -> inventory
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
        id: inv?.id ?? pf.id, // nếu inventory chưa có thì dùng pf.id làm tạm
        franchiseId,
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

    return lowOnly ? vm.filter((x) => x.lowStock) : vm;
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
            className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:opacity-90 transition"
          >
            Cập nhật
          </button>
        ),
      },
    ],
    [],
  );

  const handleUpdate = (payload: {
    quantity: number;
    alertThreshold: number;
    isActive: boolean;
  }) => {
    if (!selectedRow) return;

    setInventoryData((prev) => {
      // tìm inventory theo product_franchise_id
      const idx = prev.findIndex(
        (x) =>
          x.productFranchiseId === selectedRow.productFranchiseId &&
          !x.isDeleted,
      );

      const now = new Date().toISOString();

      if (idx === -1) {
        // chưa có inventory record -> tạo mới mock record (đồng bộ với db)
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

  // loading/empty state giả lập (vì dùng mock)
  const isEmpty = rows.length === 0;

  return (
    // 1) khóa chiều cao màn hình, 2) chặn page scroll
    <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-4">
      {/* Header: gọn, cố định */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Xem và cập nhật tồn kho theo chi nhánh
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <select
            value={franchiseId}
            onChange={(e) => setFranchiseId(Number(e.target.value))}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          >
            {franchiseOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setLowOnly((v) => !v)}
            className={[
              "px-3 py-2 rounded-xl border text-sm font-medium transition",
              lowOnly
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
            ].join(" ")}
          >
            {lowOnly ? "Đang lọc: Low stock" : "Lọc: Low stock"}
          </button>
        </div>
      </div>

      {/* Alert: cố định (không đẩy trang scroll) */}
      {hasLowStock && !lowOnly ? (
        <LowStockHint text="Có mặt hàng sắp hết. Bấm “Lọc: Low stock” để xem nhanh." />
      ) : null}

      {/* Body: chiếm phần còn lại, cuộn bên trong */}
      <div className="bg-white border border-gray-200 rounded-2xl flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex-1 min-h-0 overflow-auto">
          <CRUDTable<InventoryRowVM>
            title="Danh sách tồn kho"
            data={rows}
            columns={columns}
            pageSize={8}
            onAdd={undefined}
            onEdit={undefined}
            onDelete={undefined}
            searchKeys={["productName", "sku"]}
            statusField="isActive"
            onStatusChange={(row, st) => {
              setSelectedRow(row);
              setIsUpdateOpen(true);
              toast.message("Bạn có thể cập nhật trạng thái trong modal");
            }}
          />

          {isEmpty ? (
            <div className="px-6 pb-6 text-sm text-gray-600">
              Không có dữ liệu tồn kho cho chi nhánh này.
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal */}
      <UpdateInventoryModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelectedRow(null);
        }}
        title="Cập nhật tồn kho"
        subtitle={
          selectedRow
            ? `${selectedRow.productName} • SKU ${selectedRow.sku} • Size ${selectedRow.size}`
            : "Chỉnh số lượng và ngưỡng cảnh báo"
        }
        defaultValues={{
          quantity: selectedRow?.quantity ?? 0,
          alertThreshold: selectedRow?.alertThreshold ?? 0,
          isActive: selectedRow?.isActive ?? true,
        }}
        onSubmit={handleUpdate}
      />
    </div>
  );
};

export default InventoryPage;
