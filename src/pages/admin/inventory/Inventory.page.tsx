/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useAdminContextStore } from "@/stores/adminContext.store";

type InventoryRow = {
  id: string;
  product_franchise_id: string;
  productName: string;
  franchiseName: string;
  quantity: number;
  alertThreshold: number;
  lowStock: boolean;
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
    restore,
  } = useInventoryStore();
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<any | null>(null);
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
  }, [fetchAll, selectedFranchiseId]);

  /**
   * VIEW MODEL
   */

  const rows: InventoryRow[] = useMemo(() => {
    const vm =
      items?.map((i: any) => {
        const quantity = i.quantity ?? 0;
        const alert = i.alert_threshold ?? 0;

        return {
          id: i.id,
          product_franchise_id: i.product_franchise_id,
          productName: i.product_name,
          franchiseName: i.franchise_name,
          quantity,
          alertThreshold: alert,
          lowStock: quantity <= alert,
          isDeleted: i.is_deleted,
        };
      }) ?? [];

    const filtered = lowOnly ? vm.filter((x) => x.lowStock) : vm;

    return filtered.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [items, lowOnly]);

  /**
   * COLUMNS
   */

  const columns: Column<InventoryRow>[] = [
    {
      header: "Sản phẩm",
      accessor: (r) => (
        <div
          className={`p-2 rounded ${
            r.lowStock ? "bg-red-50 border border-red-200" : ""
          } ${r.isDeleted ? "opacity-40 line-through" : ""}`}
        >
          <div className="font-medium flex items-center gap-2">
            {r.productName}

            {r.isDeleted && (
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                Deleted
              </span>
            )}

            {r.lowStock && !r.isDeleted && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                Low
              </span>
            )}
          </div>

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
        onAdd={() => setCreateOpen(true)}
        /**
         * EDIT ICON
         */

        onEdit={(row) => {
          const inventory = items.find((i: any) => i.id === row.id);
          setAdjustItem(inventory);
        }}
        /**
         * DELETE ICON
         */

        onDelete={async (row) => {
          if (row.isDeleted) {
            await restore(row.id);
            await fetchAll();
            return;
          }

          setDeleteItem(row);
        }}
        /**
         * HEADER ACTIONS
         */

        searchRight={
          <div className="flex gap-2">
            <button
              onClick={() => setLowOnly((v) => !v)}
              className={`px-3 py-2 border rounded-lg text-sm ${
                lowOnly ? "bg-red-50 border-red-200" : ""
              }`}
            >
              {lowOnly ? "Đang lọc sắp hết" : "Lọc sắp hết"}
            </button>
          </div>
        }
      />

      <AdjustInventoryModal
        isOpen={!!adjustItem}
        inventory={adjustItem}
        onClose={() => setAdjustItem(null)}
        onSubmit={async (data) => {
          await adjust(data);
          await fetchAll();
          setAdjustItem(null);
        }}
      />

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
