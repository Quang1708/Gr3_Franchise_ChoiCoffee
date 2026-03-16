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
  InventoryLogModal,
} from "@/components/Admin/inventory/InventoryModals";

import ClientLoading from "@/components/Client/Client.Loading";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { Save } from "lucide-react";
import InventoryExcelTools from "./InventoryExcelTools";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inventoryTableSchema,
  type InventoryTableForm,
} from "./schemas/inventory.schema";

type InventoryRow = {
  id: string;
  product_franchise_id: string;
  productName: string;
  franchiseName: string;
  quantity: number;
  alertThreshold: number;
  lowStock?: boolean;
  isDeleted?: boolean;
};

const InventoryPage = () => {
  const {
    items,
    loading,
    fetchAll,
    searchInventory,
    adjust,
    adjustBulk,
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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lowOnly, setLowOnly] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [tableRows, setTableRows] = useState<InventoryRow[]>([]);
  const [logInventoryId, setLogInventoryId] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [errorRowIds, setErrorRowIds] = useState<string[]>([]);

  const hasSelection = selectedIds.length > 0;
  const {
    control,
    formState: { errors, isValid },
    reset,
  } = useForm<InventoryTableForm>({
    resolver: zodResolver(inventoryTableSchema),
    mode: "onChange",
    defaultValues: {
      rows: [],
    },
  });
  /* ===============================
     LOAD DATA
  =============================== */

  useEffect(() => {
    const load = async () => {
      setPageLoading(true);
      await fetchAll();
      setPageLoading(false);
    };

    load();
  }, [fetchAll, selectedFranchiseId]);

  /* ===============================
     VIEW MODEL
  =============================== */

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

  useEffect(() => {
    setTableRows(rows);
  }, [rows]);

  /* ===============================
     UPDATE SELECTED
  =============================== */

  const updateSelected = async () => {
    const parse = inventoryTableSchema.safeParse({
      rows: tableRows,
    });

    if (!parse.success) {
      const issues = parse.error.issues;

      const errorIds: string[] = [];
      const messages: string[] = [];

      issues.forEach((issue) => {
        const index = issue.path[1] as number;
        const row = tableRows[index];

        if (row) errorIds.push(row.id);

        messages.push(`${row?.productName}: ${issue.message}`);
      });

      setErrorRowIds(errorIds);
      setExcelErrors(messages);

      return;
    }

    const rowsUpdate = tableRows.filter((r) => selectedIds.includes(r.id));

    const itemsPayload = rowsUpdate
      .map((row) => {
        const original = items.find((i) => i.id === row.id);
        if (!original) return null;

        const change = row.quantity - original.quantity;

        if (change === 0 && row.alertThreshold === original.alert_threshold) {
          return null;
        }

        return {
          product_franchise_id: row.product_franchise_id,
          change,
          alert_threshold: row.alertThreshold,
          reason: "",
        };
      })
      .filter(Boolean);

    if (itemsPayload.length === 0) return;

    await adjustBulk({ items: itemsPayload });

    await fetchAll();
    setSelectedIds([]);
  };

  /* ===============================
     COLUMNS
  =============================== */

  const columns: Column<InventoryRow>[] = [
    {
      header: "",
      render: (r) => (
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer accent-primary"
          checked={selectedIds.includes(r.id)}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedIds((prev) => [...prev, r.id]);
            } else {
              setSelectedIds((prev) => prev.filter((id) => id !== r.id));
            }
          }}
        />
      ),
    },

    {
      header: "Sản phẩm",
      render: (r) => (
        <div
          onClick={() => {
            setSelectedIds((prev) =>
              prev.includes(r.id)
                ? prev.filter((id) => id !== r.id)
                : [...prev, r.id],
            );
          }}
          className={`p-2 rounded-md transition cursor-pointer
      ${selectedIds.includes(r.id) ? "bg-primary/10 border border-primary/30" : ""}
      ${r.lowStock ? "bg-red-50 border border-red-200" : ""}
      ${errorRowIds.includes(r.id) ? "bg-orange-50 border border-orange-300" : ""}
      ${r.isDeleted ? "opacity-40 line-through" : ""}
    `}
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
      render: (row) => (
        <input
          type="number"
          value={row.quantity}
          disabled={row.isDeleted}
          onChange={(e) => {
            const val = Number(e.target.value);

            setTableRows((prev) =>
              prev.map((r) => (r.id === row.id ? { ...r, quantity: val } : r)),
            );

            if (!selectedIds.includes(row.id)) {
              setSelectedIds((prev) => [...prev, row.id]);
            }
          }}
          className="border border-gray-200 px-2 py-1 w-20 rounded-md disabled:bg-gray-100"
        />
      ),
    },

    {
      header: "Ngưỡng cảnh báo",
      render: (row) => (
        <input
          type="number"
          value={row.alertThreshold}
          disabled={row.isDeleted}
          onChange={(e) => {
            const val = Number(e.target.value);

            setTableRows((prev) =>
              prev.map((r) =>
                r.id === row.id ? { ...r, alertThreshold: val } : r,
              ),
            );

            if (!selectedIds.includes(row.id)) {
              setSelectedIds((prev) => [...prev, row.id]);
            }
          }}
          className="border border-gray-200 px-2 py-1 w-20 rounded-md disabled:bg-gray-100"
        />
      ),
    },
  ];

  if (pageLoading || loading) return <ClientLoading />;

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-xl font-bold text-gray-800 uppercase">
            Quản lý tồn kho
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <InventoryExcelTools
              rows={tableRows}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              onErrorsChange={setExcelErrors}
              onErrorRowIdsChange={setErrorRowIds}
              onImportApply={(excelRows: any[]) => {
                setTableRows((prev) =>
                  prev.map((row) => {
                    const excel = excelRows.find(
                      (e: any) =>
                        e.product_name?.toLowerCase().trim() ===
                          row.productName.toLowerCase().trim() &&
                        e.franchise_name?.toLowerCase().trim() ===
                          row.franchiseName.toLowerCase().trim(),
                    );

                    if (!excel) return row;

                    return {
                      ...row,
                      quantity: Number(excel.quantity),
                      alertThreshold: Number(excel.alert_threshold),
                    };
                  }),
                );
              }}
            />

            <button
              onClick={updateSelected}
              disabled={!hasSelection}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm
              ${
                hasSelection
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <Save size={16} />
              Update Selected {hasSelection && `(${selectedIds.length})`}
            </button>
          </div>
        </div>
        {excelErrors.length > 0 && (
          <div className="px-6 py-4 border-b bg-orange-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-orange-700">
                ⚠ Import Errors ({excelErrors.length})
              </div>

              <button
                onClick={() => {
                  setExcelErrors([]);
                  setErrorRowIds([]);
                }}
                className="text-sm text-orange-600 hover:underline"
              >
                Clear
              </button>
            </div>

            <div className="space-y-1 max-h-40 overflow-auto">
              {excelErrors.map((err, i) => (
                <div
                  key={i}
                  className="text-sm bg-orange-100 text-orange-800 px-3 py-2 rounded-md border border-orange-200"
                >
                  {err}
                </div>
              ))}
            </div>
          </div>
        )}
        <CRUDTable
          title=""
          data={tableRows}
          columns={columns}
          pageSize={5}
          searchKeys={[]}
          deferToolsApply
          onSearch={async (value) => {
            setKeyword(value);
            await searchInventory(value);
          }}
          onRestore={async (row) => {
            await restore(row.id);
            await fetchAll();
          }}
          onAdd={() => setCreateOpen(true)}
          onEdit={(row) => {
            setAdjustItem({
              id: row.id,
              product_franchise_id: row.product_franchise_id,
              quantity: row.quantity,
              alert_threshold: row.alertThreshold,
            });
          }}
          onDelete={(row) => setDeleteItem(row)}
          onView={(row) => {
            setLogInventoryId(row.id);
          }}
          searchRight={
            <button
              onClick={() => setLowOnly((v) => !v)}
              className={`px-3 py-2 border rounded-lg text-sm font-medium
              ${
                lowOnly
                  ? "bg-red-50 border-red-300 text-red-600"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              {lowOnly ? "Đang lọc sắp hết" : "Lọc sắp hết"}
            </button>
          }
          applyButtonLabel="Search"
        />
      </div>

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

      <InventoryLogModal
        isOpen={!!logInventoryId}
        inventoryId={logInventoryId}
        onClose={() => setLogInventoryId(null)}
      />
    </div>
  );
};

export default InventoryPage;
