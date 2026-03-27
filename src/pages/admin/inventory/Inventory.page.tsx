/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, useRef } from "react";
import {
  CRUDPageTemplate,
  type Column,
} from "../../../components/Admin/template/CRUDPage.template";

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
import { inventoryTableSchema } from "./schemas/inventory.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InventoryTableForm } from "./schemas/inventory.schema";
import { can } from "@/auth/rbac";
import { PERM } from "@/auth/rbac.permissions";
import { useAuthStore } from "@/stores/auth.store";

type InventoryRow = {
  id: string;
  product_franchise_id: string;
  productName: string;
  franchiseId: string;
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
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [tableRows, setTableRows] = useState<InventoryRow[]>([]);
  const [logInventoryId, setLogInventoryId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryRow | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);
  const [franchiseFilter, setFranchiseFilter] = useState<string>("ALL");
  const [excelErrors, setExcelErrors] = useState<string[]>([]);
  const [errorRowIds, setErrorRowIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const franchiseLoading = loading || pageLoading || apiLoading;
  const hasSelection = selectedIds.length > 0;
  const user = useAuthStore((s) => s.user);
  const canUpdate = can(user, PERM.INVENTORY_UPDATE, selectedFranchiseId);
  const { register, setValue, watch, reset } = useForm<InventoryTableForm>({
    resolver: zodResolver(inventoryTableSchema),
    defaultValues: {
      rows: [],
    },
  });

  const handleSearch = async (term: string) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setApiLoading(true);

      setKeyword(term);

      if (!term.trim()) {
        await fetchAll();
      } else {
        await searchInventory(term);
      }

      setPage(1);

      setApiLoading(false);
    }, 400);
  };

  useEffect(() => {
    if (!excelErrors.length) return;

    const timer = setTimeout(() => {
      setExcelErrors([]);
      setErrorRowIds([]);
    }, 6000);

    return () => clearTimeout(timer);
  }, [excelErrors]);

  const franchiseOptions = useMemo(() => {
    const map = new Map<string, string>();

    items?.forEach((i: any) => {
      if (i.franchise_id && i.franchise_name) {
        map.set(i.franchise_id, i.franchise_name);
      }
    });

    return Array.from(map.entries()).map(([value, label]) => ({
      value,
      label,
    }));
  }, [items]);

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
          franchiseId: i.franchise_id,
          quantity,
          alertThreshold: alert,
          lowStock: quantity <= alert,
          isDeleted: i.is_deleted,
        };
      }) ?? [];

    let filtered = vm;

    if (lowOnly) {
      filtered = filtered.filter((x) => x.lowStock);
    }

    if (franchiseFilter !== "ALL") {
      filtered = filtered.filter((x) => x.franchiseId === franchiseFilter);
    }

    return filtered.sort((a, b) => a.productName.localeCompare(b.productName));
  }, [items, lowOnly, franchiseFilter]);

  useEffect(() => {
    setTableRows(rows);

    reset({
      rows: rows.map((r) => ({
        ...r,
      })),
    });
  }, [rows, reset]);

  /* ===============================
     PAGINATION
  =============================== */

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return tableRows.slice(start, end);
  }, [tableRows, page, pageSize]);

  /* ===============================
     UPDATE SELECTED
  =============================== */

  const updateSelected = async () => {
    setApiLoading(true);

    const formValues = watch();

    const parse = inventoryTableSchema.safeParse(formValues);

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

      setApiLoading(false);
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

    if (itemsPayload.length === 0) {
      setApiLoading(false);
      return;
    }

    await adjustBulk({ items: itemsPayload });

    await fetchAll();
    setSelectedIds([]);

    setApiLoading(false);
  };

  /* ===============================
     COLUMNS
  =============================== */

  const columns: Column<InventoryRow>[] = [
    {
      header: "",
      accessor: "id",
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
      accessor: "productName",
      render: (r) => (
        <div
          className={`p-2 rounded-md transition
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
      accessor: "quantity",
      render: (row) => {
        const index = tableRows.findIndex((r) => r.id === row.id);

        return (
          <input
            type="number"
            disabled={row.isDeleted || !canUpdate}
            {...register(`rows.${index}.quantity`, { valueAsNumber: true })}
            defaultValue={row.quantity}
            onChange={(e) => {
              const val = Number(e.target.value);

              setTableRows((prev) =>
                prev.map((r) =>
                  r.id === row.id ? { ...r, quantity: val } : r,
                ),
              );

              setValue(`rows.${index}.quantity`, val);

              if (!selectedIds.includes(row.id)) {
                setSelectedIds((prev) => [...prev, row.id]);
              }
            }}
            className="border border-gray-200 px-2 py-1 w-20 rounded-md"
          />
        );
      },
    },

    {
      header: "Ngưỡng cảnh báo",
      accessor: "alertThreshold",
      render: (row) => {
        const index = tableRows.findIndex((r) => r.id === row.id);

        return (
          <input
            type="number"
            disabled={row.isDeleted || !canUpdate}
            {...register(`rows.${index}.alertThreshold`, {
              valueAsNumber: true,
            })}
            defaultValue={row.alertThreshold}
            onChange={(e) => {
              const val = Number(e.target.value);

              setTableRows((prev) =>
                prev.map((r) =>
                  r.id === row.id ? { ...r, alertThreshold: val } : r,
                ),
              );

              setValue(`rows.${index}.alertThreshold`, val);

              if (!selectedIds.includes(row.id)) {
                setSelectedIds((prev) => [...prev, row.id]);
              }
            }}
            className="border border-gray-200 px-2 py-1 w-20 rounded-md"
          />
        );
      },
    },
  ];

  if (pageLoading || apiLoading) return <ClientLoading />;

  return (
    <>
      {excelErrors.length > 0 && (
        <div className="mx-6 mt-3 mb-2 p-4 border rounded-xl bg-orange-50 space-y-2">
          {" "}
          <div className="flex items-center justify-between">
            {" "}
            <div className="font-semibold text-orange-700">
              {" "}
              ⚠ Import Errors ({excelErrors.length}){" "}
            </div>{" "}
            <button
              onClick={() => {
                setExcelErrors([]);
                setErrorRowIds([]);
              }}
              className="text-sm text-orange-600 hover:underline"
            >
              {" "}
              Clear{" "}
            </button>{" "}
          </div>{" "}
          <div className="space-y-1 max-h-40 overflow-auto">
            {" "}
            {excelErrors.map((err, i) => (
              <div
                key={i}
                className="text-sm bg-orange-100 text-orange-800 px-3 py-2 rounded-md border border-orange-200"
              >
                {" "}
                {err}{" "}
              </div>
            ))}{" "}
          </div>{" "}
        </div>
      )}
      <CRUDPageTemplate
        title="Quản lý tồn kho"
        data={paginatedRows}
        columns={columns}
        currentPage={page}
        pageSize={pageSize}
        totalItems={tableRows.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        isTableLoading={loading}
        headerRight={
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

                    const quantity = Number(excel.quantity);
                    const alert = Number(excel.alert_threshold);

                    const index = prev.findIndex((r) => r.id === row.id);

                    setValue(`rows.${index}.quantity`, quantity);
                    setValue(`rows.${index}.alertThreshold`, alert);

                    return {
                      ...row,
                      quantity,
                      alertThreshold: alert,
                    };
                  }),
                );
              }}
            />

            <button
              onClick={updateSelected}
              disabled={!hasSelection || !canUpdate}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg
    ${
      hasSelection && canUpdate
        ? "bg-primary text-white hover:opacity-90 active:scale- cursor-pointer"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }`}
            >
              <Save size={16} />
              Update Selected {hasSelection && `(${selectedIds.length})`}
            </button>
          </div>
        }
        onSearch={handleSearch}
        selectedRowId={selectedItem?.id}
        onRowClick={(item) => setSelectedItem(item)}
        onRefresh={async () => {
          setPage(1);
          setKeyword("");
          await fetchAll();
        }}
        onAdd={canUpdate ? () => setCreateOpen(true) : undefined}
        onEdit={
          canUpdate
            ? (row) =>
                setAdjustItem({
                  id: row.id,
                  product_franchise_id: row.product_franchise_id,
                  quantity: row.quantity,
                  alert_threshold: row.alertThreshold,
                })
            : undefined
        }
        onDelete={canUpdate ? (row) => setDeleteItem(row) : undefined}
        onView={(row) => setLogInventoryId(row.id)}
        onRestore={
          canUpdate
            ? async (row) => {
                setApiLoading(true);
                await restore(row.id);
                await fetchAll();
                setApiLoading(false);
              }
            : undefined
        }
        searchRight={
          <div className="flex items-center gap-2 flex-wrap">
            {/* FILTER FRANCHISE */}
            <div className="relative">
              {franchiseLoading && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg z-10">
                  <ClientLoading />
                </div>
              )}

              <select
                value={franchiseFilter}
                onChange={(e) => {
                  setFranchiseFilter(e.target.value);
                  setPage(1);
                }}
                disabled={franchiseLoading}
                className="px-3 py-2 border rounded-lg text-sm bg-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="ALL">Tất cả chi nhánh</option>
                {franchiseOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* LOW STOCK FILTER */}
            <button
              onClick={() => setLowOnly((v) => !v)}
              className={`px-3 py-2 border rounded-lg text-sm
      ${
        lowOnly
          ? "bg-red-50 border-red-300 text-red-600 cursor-pointer"
          : "bg-white border-gray-200 cursor-pointer"
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
        onSubmit={async (data: any) => {
          setApiLoading(true);
          await adjust(data);
          await fetchAll();
          setAdjustItem(null);
          setApiLoading(false);
        }}
      />

      <DeleteInventoryModal
        isOpen={!!deleteItem}
        inventory={
          deleteItem
            ? { id: deleteItem.id, ingredientName: deleteItem.productName }
            : null
        }
        onClose={() => setDeleteItem(null)}
        onConfirm={async () => {
          if (!deleteItem) return;

          setApiLoading(true);

          await deleteInventory(deleteItem.id);
          await fetchAll();

          setDeleteItem(null);

          setApiLoading(false);
        }}
      />

      <CreateInventoryModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (data) => {
          setApiLoading(true);

          await create(data);
          await fetchAll();

          setCreateOpen(false);

          setApiLoading(false);
        }}
      />

      <InventoryLogModal
        isOpen={!!logInventoryId}
        inventoryId={logInventoryId}
        onClose={() => setLogInventoryId(null)}
      />
    </>
  );
};

export default InventoryPage;
