/* eslint-disable @typescript-eslint/no-explicit-any */
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, Upload } from "lucide-react";
import React from "react";
import ClientLoading from "@/components/Client/Client.Loading";

type InventoryRow = {
  id: string;
  product_franchise_id: string;
  productName: string;
  franchiseName: string;
  quantity: number;
  alertThreshold: number;
};

type PreviewRow = {
  id: string;
  productName: string;
  franchiseName: string;
  oldQuantity: number;
  newQuantity: number;
  oldAlert: number;
  newAlert: number;
  changed: boolean;
};

interface Props {
  rows: InventoryRow[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  onImportApply: (rows: any[]) => void;
  onErrorsChange?: (errors: string[]) => void;
  onErrorRowIdsChange?: (ids: string[]) => void;
}

export default function InventoryExcelTools({
  rows,
  selectedIds,
  setSelectedIds,
  onImportApply,
  onErrorsChange,
  onErrorRowIdsChange,
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const [previewRows, setPreviewRows] = React.useState<PreviewRow[]>([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);

  /* ================= EXPORT ================= */

  const exportExcel = async (onlySelected = false) => {
    setLoading(true);

    const data = onlySelected
      ? rows.filter((r) => selectedIds.includes(r.id))
      : rows;

    const exportData = data.map((r) => ({
      product_name: r.productName,
      franchise_name: r.franchiseName,
      quantity: r.quantity,
      alert_threshold: r.alertThreshold,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    /* FORMAT DATE */
    const now = new Date();
    const date =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    const filename = `inventory_export_${date}.xlsx`;

    saveAs(new Blob([buffer]), filename);

    setLoading(false);
  };

  /* ================= IMPORT ================= */

  const handleImport = (file: File) => {
    onErrorsChange?.([]);
    onErrorRowIdsChange?.([]);
    if (file.size > 2 * 1024 * 1024) {
      onErrorsChange?.(["File quá lớn (>2MB)"]);
      return;
    }

    setLoading(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);

      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      validateRows(json);

      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  /* ================= VALIDATE ================= */

  const validateRows = (rowsExcel: any[]) => {
    const errors: string[] = [];
    const errorRowIds: string[] = [];
    const selected: string[] = [];
    const preview: PreviewRow[] = [];

    const seen = new Set<string>();

    if (!rowsExcel.length) {
      onErrorsChange?.(["File không có dữ liệu"]);
      return;
    }

    if (rowsExcel.length > 500) {
      onErrorsChange?.(["File quá lớn (>500 rows)"]);
      return;
    }

    const headers = Object.keys(rowsExcel[0] || {});

    const required = [
      "product_name",
      "franchise_name",
      "quantity",
      "alert_threshold",
    ];

    const missing = required.filter((h) => !headers.includes(h));

    if (missing.length) {
      onErrorsChange?.([`Thiếu cột: ${missing.join(", ")}`]);
      return;
    }

    rowsExcel.forEach((row, index) => {
      const rowErrors: string[] = [];
      const rowIndex = index + 1;

      const product = row.product_name?.trim();
      const franchise = row.franchise_name?.trim();

      const quantity = Number(row.quantity);
      const alert = Number(row.alert_threshold);

      const key = `${product}|${franchise}`.toLowerCase();

      if (seen.has(key)) {
        rowErrors.push(`Row ${rowIndex}: duplicate product`);
      } else {
        seen.add(key);
      }

      const match = rows.find(
        (r) =>
          r.productName.toLowerCase() === product?.toLowerCase() &&
          r.franchiseName.toLowerCase() === franchise?.toLowerCase(),
      );

      if (!match) {
        rowErrors.push(`Row ${rowIndex}: product không tồn tại`);
      }

      if (isNaN(quantity) || quantity < 0) {
        rowErrors.push(`Row ${rowIndex}: quantity không hợp lệ`);
        if (match) errorRowIds.push(match.id);
      }

      if (isNaN(alert) || alert < 0) {
        rowErrors.push(`Row ${rowIndex}: alert_threshold không hợp lệ`);
        if (match) errorRowIds.push(match.id);
      }

      if (rowErrors.length || !match) {
        errors.push(...rowErrors);
        return;
      }

      selected.push(match.id);

      preview.push({
        id: match.id,
        productName: match.productName,
        franchiseName: match.franchiseName,
        oldQuantity: match.quantity,
        newQuantity: quantity,
        oldAlert: match.alertThreshold,
        newAlert: alert,
        changed: match.quantity !== quantity || match.alertThreshold !== alert,
      });
    });

    onErrorsChange?.(errors);
    onErrorRowIdsChange?.(errorRowIds);

    if (errors.length) {
      setPreviewOpen(false);
      return;
    }

    setSelectedIds(selected);
    setPreviewRows(preview);
    setPreviewOpen(true);
  };

  /* ================= APPLY ================= */

  const confirmImport = () => {
    const excelRows = previewRows.map((r) => ({
      product_name: r.productName,
      franchise_name: r.franchiseName,
      quantity: r.newQuantity,
      alert_threshold: r.newAlert,
    }));

    onImportApply(excelRows);

    setPreviewOpen(false);
  };

  if (loading) return <ClientLoading />;

  return (
    <>
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 ">
        <button
          onClick={() => exportExcel(false)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer"
        >
          <Download size={16} />
          Export All
        </button>

        <button
          onClick={() => exportExcel(true)}
          disabled={!selectedIds.length}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition
    ${
      selectedIds.length
        ? "bg-white hover:bg-gray-50 text-gray-800 cursor-pointer"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }`}
        >
          <Download size={16} />
          Export Selected {selectedIds.length > 0 && `(${selectedIds.length})`}
        </button>

        <label className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 cursor-pointer">
          <Upload size={16} />
          Import Excel
          <input
            hidden
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => {
              if (!e.target.files?.length) return;
              handleImport(e.target.files[0]);
            }}
          />
        </label>
      </div>

      {/* PREVIEW */}

      {previewOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[900px] max-h-[70vh] overflow-auto p-6">
            <h3 className="font-bold text-lg mb-4">Preview Import</h3>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Product</th>
                  <th>Quantity</th>
                  <th>Alert</th>
                </tr>
              </thead>

              <tbody>
                {previewRows.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b ${r.changed ? "bg-yellow-50" : ""}`}
                  >
                    <td className="py-2">
                      {r.productName}
                      <div className="text-xs text-gray-500">
                        {r.franchiseName}
                      </div>
                    </td>

                    <td className="text-center">
                      {r.oldQuantity} →{" "}
                      <span className="font-semibold">{r.newQuantity}</span>
                    </td>

                    <td className="text-center">
                      {r.oldAlert} →{" "}
                      <span className="font-semibold">{r.newAlert}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={confirmImport}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
