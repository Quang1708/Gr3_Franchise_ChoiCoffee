import { useEffect, useMemo, useState } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import ClientLoading from "@/components/Client/Client.Loading";
import type { Voucher, VoucherType } from "@/models/voucher.model";
import {
  changeVoucherStatus,
  createVoucher,
  deleteVoucher,
  getVoucher,
  restoreVoucher,
  searchVouchers,
} from "@/services/voucher.service";
import {
  franchiseService,
  type FranchiseSelectItem,
} from "@/services/franchise.service";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { CRUDPageTemplate, type Column } from "@/components/Admin/template/CRUDPage.template";

type VoucherRow = Voucher & {
  is_deleted: boolean;
  /** Tên chi nhánh để hiển thị / sort / search */
  franchiseDisplay: string;
};

/** Badge loại voucher — cùng phong cách Loại đơn (Order page) */
const voucherTypeColor: Record<VoucherType, string> = {
  PERCENT: "bg-indigo-100 text-indigo-800",
  FIXED: "bg-emerald-100 text-emerald-800",
};

const voucherTypeLabel: Record<VoucherType, string> = {
  PERCENT: "Giảm %",
  FIXED: "Giảm tiền",
};

const formatDate = (value?: string) => {
  if (!value) return "--";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("vi-VN");
};

const VoucherApiPage = () => {
  const selectedFranchiseId = useAdminContextStore((s) => s.selectedFranchiseId);
  const isAdminMode = selectedFranchiseId === null;

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [franchises, setFranchises] = useState<FranchiseSelectItem[]>([]);
  const [isFranchisesLoading, setIsFranchisesLoading] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState<{
    franchiseId: string;
    code: string;
    name: string;
    description: string;
    type: VoucherType;
    value: number;
    productFranchiseId: string;
    quotaTotal: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }>({
    franchiseId: "",
    code: "",
    name: "",
    description: "",
    type: "FIXED",
    value: 0,
    productFranchiseId: "",
    quotaTotal: 0,
    startTime: "",
    endTime: "",
    isActive: true,
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<Voucher | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "restore">("delete");
  const [confirmItem, setConfirmItem] = useState<VoucherRow | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const franchiseLabelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of franchises) m.set(f.value, f.name);
    return m;
  }, [franchises]);

  const getFranchiseName = (voucher: Voucher) => {
    if (voucher.franchiseName) return voucher.franchiseName;
    return (
      franchiseLabelById.get(String(voucher.franchiseId)) || `#${voucher.franchiseId}`
    );
  };

  const fetchFranchises = async () => {
    try {
      setIsFranchisesLoading(true);
      const data = await franchiseService.getAllSelect();
      setFranchises(Array.isArray(data) ? data : []);
    } catch {
      toastError("Không thể tải danh sách chi nhánh");
    } finally {
      setIsFranchisesLoading(false);
    }
  };

  const fetchVoucherList = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const franchiseId =
        !isAdminMode && selectedFranchiseId != null
          ? String(selectedFranchiseId)
          : undefined;

      // hỗ trợ cả restore
      const [activeList, deletedList] = await Promise.all([
        searchVouchers({
          franchiseId,
          isDeleted: false,
          pageNum: 1,
          pageSize: 1000,
          keyword: "",
        } as any),
        searchVouchers({
          franchiseId,
          isDeleted: true,
          pageNum: 1,
          pageSize: 1000,
          keyword: "",
        } as any),
      ]);

      const merged = [...(activeList ?? []), ...(deletedList ?? [])];
      const map = new Map<string, Voucher>();
      for (const v of merged) map.set(String(v.id), v);
      setVouchers(Array.from(map.values()));
    } catch (e) {
      const msg =
        typeof (e as any)?.message === "string"
          ? (e as any).message
          : "Không thể tải danh sách voucher";
      setError(msg);
      toastError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchFranchises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void fetchVoucherList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFranchiseId, isAdminMode]);

  useEffect(() => {
    if (!isAdminMode && selectedFranchiseId != null) {
      setCreateForm((p) => ({ ...p, franchiseId: String(selectedFranchiseId) }));
    }
  }, [isAdminMode, selectedFranchiseId]);

  const tableData: VoucherRow[] = useMemo(
    () =>
      vouchers.map((v) => ({
        ...v,
        is_deleted: v.isDeleted,
        franchiseDisplay:
          v.franchiseName ||
          franchiseLabelById.get(String(v.franchiseId)) ||
          `#${v.franchiseId}`,
      })),
    [vouchers, franchiseLabelById],
  );

  /** Lọc theo khoảng ngày (theo ngày bắt đầu hiệu lực), giống Order page */
  const filteredTableData = useMemo(() => {
    if (!fromDate && !toDate) return tableData;
    return tableData.filter((row) => {
      const d = new Date(row.startTime);
      if (Number.isNaN(d.getTime())) return false;
      if (fromDate) {
        const f = new Date(`${fromDate}T00:00:00`);
        if (d < f) return false;
      }
      if (toDate) {
        const t = new Date(`${toDate}T23:59:59.999`);
        if (d > t) return false;
      }
      return true;
    });
  }, [tableData, fromDate, toDate]);

  const columns: Column<VoucherRow>[] = useMemo(
    () => [
      {
        header: "Mã voucher",
        accessor: "code",
        className: "min-w-[140px]",
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
        accessor: "franchiseDisplay",
        className: "min-w-[200px]",
        sortable: true,
      },
      {
        header: "Loại",
        accessor: "type",
        sortable: true,
        render: (it) => (
          <span
            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${voucherTypeColor[it.type]}`}
          >
            {voucherTypeLabel[it.type]}
          </span>
        ),
      },
      {
        header: "Giá trị",
        accessor: "value",
        sortable: true,
        render: (it) => (
          <span className="font-semibold text-primary">
            {it.type === "PERCENT"
              ? `${it.value}%`
              : `${Number(it.value).toLocaleString("vi-VN")} đ`}
          </span>
        ),
      },
      {
        header: "Đã dùng / Tổng",
        accessor: "quotaUsed",
        sortable: true,
        render: (it) => `${it.quotaUsed} / ${it.quotaTotal}`,
      },
      {
        header: "Từ ngày",
        accessor: "startTime",
        sortable: true,
        render: (it) => formatDate(it.startTime),
      },
      {
        header: "Đến ngày",
        accessor: "endTime",
        sortable: true,
        render: (it) => formatDate(it.endTime),
      },
    ],
    [],
  );

  const handleOpenCreate = () => {
    setCreateForm({
      franchiseId: selectedFranchiseId ? String(selectedFranchiseId) : "",
      code: "",
      name: "",
      description: "",
      type: "FIXED",
      value: 0,
      productFranchiseId: "",
      quotaTotal: 0,
      startTime: "",
      endTime: "",
      isActive: true,
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async () => {
    if (!createForm.franchiseId) {
      toastError("Vui lòng chọn chi nhánh");
      return;
    }
    if (!createForm.code.trim() || !createForm.name.trim()) {
      toastError("Vui lòng nhập `Mã` và `Tên voucher`");
      return;
    }
    if (!createForm.startTime || !createForm.endTime) {
      toastError("Vui lòng chọn thời gian bắt đầu và kết thúc");
      return;
    }

    try {
      setIsCreateLoading(true);
      await createVoucher({
        code: createForm.code.trim(),
        franchiseId: createForm.franchiseId,
        productFranchiseId:
          createForm.productFranchiseId.trim() === ""
            ? null
            : createForm.productFranchiseId.trim(),
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        type: createForm.type,
        value: Number(createForm.value),
        quotaTotal: Number(createForm.quotaTotal),
        startTime: createForm.startTime,
        endTime: createForm.endTime,
        isActive: Boolean(createForm.isActive),
      });
      toastSuccess("Tạo voucher thành công");
      setIsCreateOpen(false);
      await fetchVoucherList();
    } catch (e) {
      const msg =
        typeof (e as any)?.message === "string"
          ? (e as any).message
          : "Tạo voucher thất bại";
      toastError(msg);
    } finally {
      setIsCreateLoading(false);
    }
  };

  const handleView = async (item: VoucherRow) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const full = await getVoucher(String(item.id));
      setDetail(full);
    } catch {
      setDetail(item);
    } finally {
      setDetailLoading(false);
    }
  };

  const openConfirm = (type: "delete" | "restore", item: VoucherRow) => {
    setConfirmType(type);
    setConfirmItem(item);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmItem) return;
    try {
      setConfirmLoading(true);
      const id = String(confirmItem.id);
      if (confirmType === "delete") {
        await deleteVoucher(id);
        toastSuccess("Đã xóa voucher");
      } else {
        await restoreVoucher(id);
        toastSuccess("Đã khôi phục voucher");
      }
      setConfirmOpen(false);
      setConfirmItem(null);
      await fetchVoucherList();
    } catch (e) {
      const msg =
        typeof (e as any)?.message === "string"
          ? (e as any).message
          : "Thao tác thất bại";
      toastError(msg);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleChangeStatus = async (item: VoucherRow, newStatus: boolean) => {
    try {
      await changeVoucherStatus(String(item.id), newStatus);
      toastSuccess("Cập nhật trạng thái thành công");
      await fetchVoucherList();
    } catch (e) {
      const msg =
        typeof (e as any)?.message === "string"
          ? (e as any).message
          : "Cập nhật trạng thái thất bại";
      toastError(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 transition-all animate-fade-in">
        <ClientLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 transition-all animate-fade-in">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          <p className="font-medium">{error}</p>
          <button
            type="button"
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            onClick={() => void fetchVoucherList()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/*
        Layout giống Order page: một khối CRUDTable (tiêu đề IN HOA trong card),
        thanh tìm kiếm + lọc ngày trái, dropdown lọc phải, badge loại, giá trị màu primary.
      */}
      <CRUDPageTemplate<VoucherRow>
        title="Danh sách voucher"
        data={filteredTableData}
        columns={columns}
        pageSize={5}
        onAdd={handleOpenCreate}
        onView={handleView}
        onDelete={(item) => openConfirm("delete", item)}
        onRestore={(item) => openConfirm("restore", item)}
        statusField="isActive"
        onStatusChange={handleChangeStatus}
        searchKeys={["code", "name", "franchiseDisplay", "type"]}
        searchRight={
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Lọc từ ngày"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="Lọc đến ngày"
            />
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Xóa ngày
            </button>
          </div>
        }
        filters={[
          {
            key: "type",
            label: "Loại voucher",
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

      <CRUDModalTemplate
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateSubmit}
        title="Voucher"
        mode="create"
        isLoading={isCreateLoading}
        maxWidth="max-w-2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chi nhánh
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:bg-gray-50"
              value={createForm.franchiseId}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, franchiseId: e.target.value }))
              }
              disabled={!isAdminMode || isFranchisesLoading}
            >
              <option value="" disabled>
                {isFranchisesLoading ? "Đang tải chi nhánh..." : "Chọn chi nhánh"}
              </option>
              {franchises.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name} ({f.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã voucher
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={createForm.code}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, code: e.target.value }))
              }
              placeholder="VD: GIAM10-Q1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên voucher
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="VD: Voucher khuyến mãi tháng 4"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={createForm.description}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Tuỳ chọn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={createForm.type}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  type: e.target.value as VoucherType,
                }))
              }
            >
              <option value="FIXED">FIXED</option>
              <option value="PERCENT">PERCENT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá trị
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={createForm.value}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  value: Number(e.target.value),
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product franchise id
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={createForm.productFranchiseId}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  productFranchiseId: e.target.value,
                }))
              }
              placeholder="Để trống = toàn chi nhánh"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quota tổng
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={createForm.quotaTotal}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  quotaTotal: Number(e.target.value),
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start date
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={createForm.startTime}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  startTime: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End date
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              value={createForm.endTime}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  endTime: e.target.value,
                }))
              }
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              checked={createForm.isActive}
              onChange={(e) =>
                setCreateForm((p) => ({
                  ...p,
                  isActive: e.target.checked,
                }))
              }
              id="voucher-is-active"
            />
            <label
              htmlFor="voucher-is-active"
              className="text-sm font-medium text-gray-700 select-none cursor-pointer"
            >
              Kích hoạt
            </label>
          </div>
        </div>
      </CRUDModalTemplate>

      <CRUDModalTemplate
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetail(null);
        }}
        title="Voucher"
        mode="view"
        isLoading={detailLoading}
        maxWidth="max-w-lg"
      >
        {detailLoading ? (
          <div className="text-sm text-gray-600">Đang tải...</div>
        ) : detail ? (
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Mã:</span>
              <span className="font-semibold text-gray-900">{detail.code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Tên:</span>
              <span className="font-semibold text-gray-900">{detail.name}</span>
            </div>
            {detail.description ? (
              <div>
                <div className="font-medium text-gray-500 mb-1">Mô tả</div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
                  {detail.description}
                </div>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Chi nhánh:</span>
              <span className="font-semibold text-gray-900">
                {getFranchiseName(detail)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Product:</span>
              <span className="font-semibold text-gray-900">
                {detail.productFranchiseId
                  ? String(detail.productFranchiseId)
                  : "Toàn cửa hàng"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Loại:</span>
              <span className="font-semibold text-gray-900">
                {detail.type === "PERCENT" ? "Giảm %" : "Giảm tiền"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Giá trị:</span>
              <span className="font-semibold text-gray-900">
                {detail.type === "PERCENT"
                  ? `${detail.value}%`
                  : `${Number(detail.value).toLocaleString("vi-VN")}₫`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Quota:</span>
              <span className="font-semibold text-gray-900">
                {detail.quotaUsed} / {detail.quotaTotal}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Từ ngày:</span>
              <span className="font-semibold text-gray-900">
                {formatDate(detail.startTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Đến ngày:</span>
              <span className="font-semibold text-gray-900">
                {formatDate(detail.endTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-500">Trạng thái:</span>
              <span className="font-semibold text-gray-900">
                {detail.isDeleted ? "Đã xóa" : detail.isActive ? "Đang dùng" : "Tắt"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Không có dữ liệu</div>
        )}
      </CRUDModalTemplate>

      <ActionConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmItem(null);
        }}
        onConfirm={handleConfirm}
        type={confirmType}
        isLoading={confirmLoading}
        title={confirmType === "delete" ? "Xác nhận xóa" : "Xác nhận khôi phục"}
        message={
          confirmItem
            ? confirmType === "delete"
              ? `Bạn đang xóa voucher "${confirmItem.code}". Hành động này không thể hoàn tác.`
              : `Bạn đang khôi phục voucher "${confirmItem.code}".`
            : undefined
        }
      />
    </>
  );
};

export default VoucherApiPage;

