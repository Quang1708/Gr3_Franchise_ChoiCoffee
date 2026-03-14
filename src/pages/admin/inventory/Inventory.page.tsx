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
import { Save } from "lucide-react";
import InventoryExcelTools from "./InventoryExcelTools";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inventoryTableSchema } from "./schemas/inventory.schema";
import type { InventoryTableForm } from "./schemas/inventory.schema";

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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lowOnly, setLowOnly] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [errorRowIds, setErrorRowIds] = useState<string[]>([]);
  const hasSelection = selectedIds.length > 0;

  useEffect(() => {
    const load = async () => {
      setPageLoading(true);
      await fetchAll();
      setPageLoading(false);
    };

    load();
  }, [fetchAll, selectedFranchiseId]);

  const form = useForm<InventoryTableForm>({
    resolver: zodResolver(inventoryTableSchema),
    defaultValues: {
      rows: [],
    },
    mode: "onChange",
  });

  const { register, control, reset, setValue, getValues, formState } = form;

  const { fields } = useFieldArray({
    control,
    name: "rows",
  });

  const hasFormError = Object.keys(formState.errors).length > 0;

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

  /* sync rows -> draftRows */

  useEffect(() => {
    reset({
      rows,
    });
  }, [rows, reset]);

  /* ===============================
     UPDATE SELECTED
  =============================== */
  const updateSelected = async () => {
    const formRows = getValues("rows");

    const rowsUpdate = formRows.filter((r) => selectedIds.includes(r.id));

    await adjust(rowsUpdate);
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
          className={`p-2 rounded-md transition
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
      render: (row, index) => (
        <div>
          <input
            type="number"
            {...register(`rows.${index}.quantity`, {
              valueAsNumber: true,
            })}
            disabled={row.isDeleted}
            className="border border-gray-200 px-2 py-1 w-20 rounded-md disabled:bg-gray-100"
          />

          {formState.errors.rows?.[index]?.quantity && (
            <div className="text-xs text-red-500">
              {formState.errors.rows[index]?.quantity?.message}
            </div>
          )}
        </div>
      ),
    },

    {
      header: "Ngưỡng cảnh báo",
      render: (row, index) => (
        <div>
          <input
            type="number"
            {...register(`rows.${index}.alertThreshold`, {
              valueAsNumber: true,
            })}
            disabled={row.isDeleted}
            className="border border-gray-200 px-2 py-1 w-20 rounded-md disabled:bg-gray-100"
          />

          {formState.errors.rows?.[index]?.alertThreshold && (
            <div className="text-xs text-red-500">
              {formState.errors.rows[index]?.alertThreshold?.message}
            </div>
          )}
        </div>
      ),
    },
  ];

  if (pageLoading || loading) return <ClientLoading />;

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-xl font-bold text-gray-800 uppercase">
                Quản lý tồn kho
              </h2>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 flex-wrap">
              <InventoryExcelTools
                rows={fields}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                onErrorsChange={setExcelErrors}
                onErrorRowIdsChange={setErrorRowIds}
                onImportApply={(excelRows: any[]) => {
                  const updated = getValues("rows").map((row) => {
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
                  });

                  setValue("rows", updated, { shouldValidate: true });
                }}
              />

              <button
                onClick={form.handleSubmit(updateSelected)}
                disabled={!hasSelection || hasFormError}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition-all cursor-pointer
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
        </div>
        {/* ERROR ROW */}
        {excelErrors.length > 0 && (
          <div className="px-6 py-4 border-b bg-orange-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-orange-700">
                ⚠ Import Errors ({excelErrors.length})
              </div>

              <button
                onClick={() => setExcelErrors([])}
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
          data={fields}
          columns={columns}
          pageSize={5}
          searchKeys={["productName", "franchiseName"]}
          onAdd={() => setCreateOpen(true)}
          onEdit={(row) => {
            const inventory = items.find((i: any) => i.id === row.id);
            setAdjustItem(inventory);
          }}
          onDelete={async (row) => {
            if (row.isDeleted) {
              await restore(row.id);
              await fetchAll();
              return;
            }

            setDeleteItem(row);
          }}
          searchRight={
            <button
              onClick={() => setLowOnly((v) => !v)}
              className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all cursor-pointer
                ${
                  lowOnly
                    ? "bg-red-50 border-red-300 text-red-600"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
            >
              {lowOnly ? "Đang lọc sắp hết" : "Lọc sắp hết"}
            </button>
          }
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
    </div>
  );
};

export default InventoryPage;
