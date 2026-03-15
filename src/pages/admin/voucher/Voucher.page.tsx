import { useEffect, useMemo, useState } from "react";
import { CRUDTable, type Column } from "@/components/Admin/template/CRUD.template";
import {
  deleteVoucher,
  getVoucher,
  restoreVoucher,
  searchVouchers,
  type VoucherSearchPayload,
} from "@/services/voucher.service";
import type { Voucher } from "@/models/voucher.model";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { useAdminContextStore } from "@/stores/adminContext.store";

const formatDate = (value?: string) => {
  if (!value) return "--";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("vi-VN");
};

const VoucherPage = () => {
  const selectedFranchiseId = useAdminContextStore((s) => s.selectedFranchiseId);
  const [list, setList] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<Voucher | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadList = async (payload?: VoucherSearchPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const search: VoucherSearchPayload = {
        ...payload,
        franchiseId: selectedFranchiseId ? Number(selectedFranchiseId) : undefined,
      };
      const data = await searchVouchers(search);
      setList(data);
    } catch (e) {
      setError("Không thể tải danh sách voucher");
      toastError?.("Không thể tải danh sách voucher");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadList();
  }, [selectedFranchiseId]);

  const handleView = async (item: Voucher) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const v = await getVoucher(item.id);
      setDetail(v);
    } catch {
      setDetail(item);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (item: Voucher) => {
    if (!window.confirm(`Xóa voucher "${item.code}"?`)) return;
    try {
      await deleteVoucher(item.id);
      toastSuccess?.("Đã xóa voucher");
      void loadList();
    } catch {
      toastError?.("Xóa voucher thất bại");
    }
  };

  const handleRestore = async (item: Voucher) => {
    if (!window.confirm(`Khôi phục voucher "${item.code}"?`)) return;
    try {
      await restoreVoucher(item.id);
      toastSuccess?.("Đã khôi phục voucher");
      void loadList();
      setDetailOpen(false);
      setDetail(null);
    } catch {
      toastError?.("Khôi phục thất bại");
    }
  };

  const columns: Column<Voucher>[] = useMemo(
    () => [
      {
        header: "Mã",
        accessor: "code",
        className: "min-w-[120px]",
        sortable: true,
      },
      {
        header: "Tên",
        accessor: "name",
        className: "min-w-[180px]",
        sortable: true,
      },
      {
        header: "Chi nhánh",
        accessor: "franchiseId",
        sortable: true,
        render: (it) => `#${it.franchiseId}`,
      },
      {
        header: "Loại",
        accessor: "type",
        render: (it) => (it.type === "PERCENT" ? "Giảm %" : "Giảm tiền"),
      },
      {
        header: "Giá trị",
        accessor: "value",
        sortable: true,
        render: (it) =>
          it.type === "PERCENT"
            ? `${it.value}%`
            : it.value.toLocaleString("vi-VN") + "₫",
      },
      {
        header: "Đã dùng / Tổng",
        accessor: "quotaUsed",
        render: (it) => `${it.quotaUsed} / ${it.quotaTotal}`,
      },
      {
        header: "Từ ngày",
        accessor: "startTime",
        render: (it) => formatDate(it.startTime),
      },
      {
        header: "Đến ngày",
        accessor: "endTime",
        render: (it) => formatDate(it.endTime),
      },
      {
        header: "Trạng thái",
        accessor: "isActive",
        render: (it) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
              it.isDeleted
                ? "bg-gray-100 text-gray-600"
                : it.isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {it.isDeleted ? "Đã xóa" : it.isActive ? "Đang dùng" : "Tắt"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="p-6 transition-all animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quản lý Voucher</h1>

      {isLoading ? (
        <div>Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <CRUDTable<Voucher>
          title="Danh sách voucher"
          data={list}
          columns={columns}
          pageSize={10}
          onView={handleView}
          onDelete={handleDelete}
          onRestore={handleRestore}
          searchKeys={["code", "name", "franchiseId", "type", "value"]}
          filters={[
            {
              key: "type",
              label: "Loại",
              options: [
                { value: "PERCENT", label: "Giảm %" },
                { value: "FIXED", label: "Giảm tiền" },
              ],
            },
            {
              key: "isActive",
              label: "Trạng thái",
              options: [
                { value: "true", label: "Đang dùng" },
                { value: "false", label: "Tắt" },
              ],
            },
          ]}
        />
      )}

      {/* Modal chi tiết */}
      {detailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Chi tiết voucher: {detail?.code ?? "..."}
              </h3>
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setDetailOpen(false);
                  setDetail(null);
                }}
              >
                Đóng
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {detailLoading ? (
                <p>Đang tải...</p>
              ) : detail ? (
                <>
                  <p>
                    <span className="font-medium text-gray-600">Mã:</span>{" "}
                    {detail.code}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Tên:</span>{" "}
                    {detail.name}
                  </p>
                  {detail.description ? (
                    <p>
                      <span className="font-medium text-gray-600">Mô tả:</span>{" "}
                      {detail.description}
                    </p>
                  ) : null}
                  <p>
                    <span className="font-medium text-gray-600">Chi nhánh:</span>{" "}
                    #{detail.franchiseId}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Sản phẩm (product_franchise_id):</span>{" "}
                    {detail.productFranchiseId ?? "Toàn cửa hàng"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Loại:</span>{" "}
                    {detail.type === "PERCENT" ? "Giảm %" : "Giảm tiền"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Giá trị:</span>{" "}
                    {detail.type === "PERCENT"
                      ? `${detail.value}%`
                      : `${detail.value.toLocaleString("vi-VN")}₫`}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Quota:</span>{" "}
                    {detail.quotaUsed} / {detail.quotaTotal} lượt
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Từ ngày:</span>{" "}
                    {formatDate(detail.startTime)}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Đến ngày:</span>{" "}
                    {formatDate(detail.endTime)}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Trạng thái:</span>{" "}
                    {detail.isDeleted ? "Đã xóa" : detail.isActive ? "Đang dùng" : "Tắt"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Người tạo:</span>{" "}
                    #{detail.createdBy}
                  </p>
                  {detail.isDeleted && (
                    <button
                      type="button"
                      className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                      onClick={() => handleRestore(detail)}
                    >
                      Khôi phục
                    </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Không có dữ liệu</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherPage;
