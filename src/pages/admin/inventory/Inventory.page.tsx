import { useEffect, useMemo, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "@/components/Admin/template/CRUD.template";
import { useInventoryStore } from "@/stores/useInventoryStore";
import { useProductFranchiseStore } from "@/stores/useProductFranchiseStore";
import { useAdminContextStore } from "@/stores/adminContext.store";

type InventoryRow = {
  id: string;
  productName: string;
  size: string;
  quantity: number;
  alertThreshold: number;
  isActive: boolean;
  lowStock: boolean;
};

const InventoryPage = () => {
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);

  const {
    items: inventories,
    fetchByFranchise,
    loading: inventoryLoading,
  } = useInventoryStore();

  const {
    items: productFranchises,
    fetchByFranchise: fetchPF,
    loading: productLoading,
  } = useProductFranchiseStore();

  const [lowOnly, setLowOnly] = useState(false);

  /* -------------------------------------------------- */
  /* FETCH DATA                                         */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!franchiseId) return;

    fetchPF(String(franchiseId));
    fetchByFranchise(String(franchiseId));
  }, [franchiseId, fetchPF, fetchByFranchise]);

  /* -------------------------------------------------- */
  /* MAP INVENTORY (snake_case đúng API)                */
  /* -------------------------------------------------- */

  const inventoryMap = useMemo(() => {
    return new Map(inventories.map((i) => [i.productFranchiseId, i]));
  }, [inventories]);

  /* -------------------------------------------------- */
  /* VIEW MODEL                                          */
  /* -------------------------------------------------- */

  const rows: InventoryRow[] = useMemo(() => {
    if (!franchiseId) return [];

    const vm = productFranchises.map((pf) => {
      const inv = inventoryMap.get(pf.id);

      const quantity = inv?.quantity ?? 0;
      const alertThreshold = inv?.alertThreshold ?? 0;
      const lowStock = quantity <= alertThreshold;

      return {
        id: pf.id,
        productName: pf.product_name,
        size: pf.size,
        quantity,
        alertThreshold,
        isActive: inv?.isActive ?? true,
        lowStock,
      };
    });

    const filtered = lowOnly ? vm.filter((x) => x.lowStock) : vm;

    return filtered.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [franchiseId, productFranchises, inventoryMap, lowOnly]);

  /* -------------------------------------------------- */
  /* TABLE COLUMNS                                       */
  /* -------------------------------------------------- */

  const columns: Column<InventoryRow>[] = [
    {
      header: "Sản phẩm",
      accessor: (r) => (
        <div>
          <div className="font-medium">{r.productName}</div>
          <div className="text-xs text-gray-500">Size: {r.size}</div>
        </div>
      ),
    },
    {
      header: "Số lượng",
      accessor: (r) => (
        <span
          className={
            r.lowStock ? "text-rose-700 font-semibold" : "text-gray-900"
          }
        >
          {r.quantity}
        </span>
      ),
    },
    {
      header: "Ngưỡng cảnh báo",
      accessor: (r) => r.alertThreshold,
    },
    {
      header: "Trạng thái",
      accessor: (r) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            r.isActive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {r.isActive ? "AVAILABLE" : "OUT_OF_STOCK"}
        </span>
      ),
    },
  ];

  /* -------------------------------------------------- */
  /* RENDER                                              */
  /* -------------------------------------------------- */

  if (!franchiseId) {
    return (
      <div className="p-6 text-gray-500">
        Vui lòng chọn franchise để xem tồn kho.
      </div>
    );
  }

  return (
    <div className="p-6">
      <CRUDTable
        title="Danh sách tồn kho"
        data={rows}
        columns={columns}
        pageSize={10}
        loading={inventoryLoading || productLoading}
        searchKeys={["productName"]}
        searchRightSlot={
          <button
            onClick={() => setLowOnly((v) => !v)}
            className={`px-3 py-2 border rounded-lg text-sm ${
              lowOnly ? "bg-rose-50 border-rose-200" : ""
            }`}
          >
            {lowOnly ? "Đang lọc sản phẩm sắp hết" : "Lọc sản phẩm sắp hết"}
          </button>
        }
      />
    </div>
  );
};

export default InventoryPage;
