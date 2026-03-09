import { useEffect, useMemo, useState } from "react";
import {
  CRUDTable,
  type Column,
} from "@/components/Admin/template/CRUD.template";

import { useInventoryStore } from "../inventory/stores/useInventoryStore";

import {
  AdjustInventoryModal,
  DeleteInventoryModal,
  CreateInventoryModal,
} from "@/components/Admin/inventory/InventoryModals";

import ClientLoading from "@/components/Client/Client.Loading";

type InventoryRow = {
  id: string;
  productName: string;
  franchiseName: string;
  quantity: number;
  alertThreshold: number;
  lowStock: boolean;
  isActive: boolean;
  isDeleted: boolean;
};

const InventoryPage = () => {
  const {
    items,
    loading,
    fetchAll,
    adjust,
    create,
    delete: deleteInventory,
  } = useInventoryStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryRow | null>(null);

  const [lowOnly, setLowOnly] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setPageLoading(true);
      await fetchAll();
      setPageLoading(false);
    };

    load();
  }, [fetchAll]);

  const rows: InventoryRow[] = useMemo(() => {
    if (!Array.isArray(items)) return [];

    const vm = items.map((i: any) => {
      const quantity = i.quantity ?? 0;
      const alertThreshold = i.alert_threshold ?? 0;

      return {
        id: i.id,
        productName: i.product_name,
        franchiseName: i.franchise_name,
        quantity,
        alertThreshold,
        lowStock: quantity <= alertThreshold,
        isActive: i.is_active,
        isDeleted: i.is_deleted,
      };
    });

    const filtered = lowOnly ? vm.filter((x) => x.lowStock) : vm;

    return filtered.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [items, lowOnly]);

  const columns: Column<InventoryRow>[] = [
    {
      header: "Sản phẩm",
      accessor: (r) => (
        <div
          className={`p-2 rounded ${
            r.lowStock ? "bg-red-50 border border-red-200" : ""
          }`}
        >
          <div className="font-medium">{r.productName}</div>
          <div className="text-xs text-gray-500">{r.franchiseName}</div>
        </div>
      ),
    },
    {
      header: "Số lượng",
      accessor: (r) => (
        <span
          className={`font-semibold ${
            r.lowStock ? "text-red-600" : "text-gray-800"
          }`}
        >
          {r.quantity}
        </span>
      ),
    },
    {
      header: "Ngưỡng cảnh báo",
      accessor: (r) => r.alertThreshold,
    },
  ];

  if (pageLoading || loading) return <ClientLoading />;

  return (
    <div className="p-6">
      <CRUDTable
        title="Quản lý tồn kho"
        data={rows}
        columns={columns}
        pageSize={5}
        searchKeys={["productName", "franchiseName"]}
        onCreate={() => setCreateOpen(true)}
        onEdit={(row) => setAdjustId(row.id)}
        onDelete={(row) => setDeleteItem(row)}
        searchRight={
          <button
            onClick={() => setLowOnly((v) => !v)}
            className={`px-3 py-2 border rounded-lg text-sm ${
              lowOnly ? "bg-red-50 border-red-200" : ""
            }`}
          >
            {lowOnly ? "Đang lọc sản phẩm sắp hết" : "Lọc sản phẩm sắp hết"}
          </button>
        }
      />

      {/* Adjust Modal */}
      <AdjustInventoryModal
        isOpen={!!adjustId}
        inventoryId={adjustId}
        onClose={() => setAdjustId(null)}
        onSubmit={async (data) => {
          await adjust(data);
          await fetchAll();
        }}
      />

      {/* Delete Modal */}
      <DeleteInventoryModal
        isOpen={!!deleteItem}
        inventory={
          deleteItem
            ? {
                id: deleteItem.id,
                ingredientName: deleteItem.productName,
              }
            : null
        }
        onClose={() => setDeleteItem(null)}
        onConfirm={async () => {
          if (!deleteItem) return;

          await deleteInventory(deleteItem.id);
          await fetchAll();
          setDeleteItem(null);
        }}
      />

      <CreateInventoryModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (data) => {
          await create(data);
          await fetchAll();
          setCreateOpen(false);
        }}
      />
    </div>
  );
};

export default InventoryPage;
