import { useEffect, useMemo, useState } from "react";
import { Plus, CalendarPlus } from "lucide-react";
import {
  CRUDTable,
  type Column,
} from "@/components/Admin/template/CRUD.template";
import ClientLoading from "@/components/Client/Client.Loading";
import { toastError, toastSuccess } from "@/utils/toast.util";
import {
  shiftAssignment01Service,
  shiftAssignment02Service,
  shiftAssignment03Service,
  shiftAssignment04Service,
  shiftAssignment05Service,
  shiftGetByIdService,
} from "./services";
import type {
  ShiftAssignmentBulkRow,
  ShiftAssignmentCreatePayload,
  ShiftAssignmentItem,
  ShiftAssignmentSearchPayload,
  ShiftAssignmentStatus,
} from "./models/shiftAssignment.model";
import { STATUS_OPTIONS, statusBadge, today } from "./shiftAssignment.utils";
import { ShiftAssignmentSearch } from "./components/ShiftAssignmentSearch";
import { ShiftAssignmentModals } from "./components/ShiftAssignmentModals";
import { userApi } from "@/api/user/user.api";

// ── Response helpers ──────────────────────────────────────────────────────────

const extractArray = (payload: unknown): ShiftAssignmentItem[] => {
  if (Array.isArray(payload)) return payload as ShiftAssignmentItem[];
  if (!payload || typeof payload !== "object") return [];
  const data = payload as { data?: unknown; items?: unknown; rows?: unknown };
  if (Array.isArray(data.data)) return data.data as ShiftAssignmentItem[];
  if (data.data && typeof data.data === "object") {
    const nested = data.data as { items?: unknown; rows?: unknown };
    if (Array.isArray(nested.items))
      return nested.items as ShiftAssignmentItem[];
    if (Array.isArray(nested.rows)) return nested.rows as ShiftAssignmentItem[];
  }
  if (Array.isArray(data.items)) return data.items as ShiftAssignmentItem[];
  if (Array.isArray(data.rows)) return data.rows as ShiftAssignmentItem[];
  return [];
};

const extractItem = (payload: unknown): ShiftAssignmentItem | null => {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as { data?: unknown };
  const raw = (data.data ?? payload) as Record<string, unknown>;
  const nestedUser =
    raw.user && typeof raw.user === "object"
      ? (raw.user as Record<string, unknown>)
      : undefined;
  const id =
    (raw.id as string | undefined) ?? (raw._id as string | undefined) ?? "";
  if (!id) return null;
  return {
    id,
    user_id: String(raw.user_id ?? ""),
    user_name: raw.user_name
      ? String(raw.user_name)
      : raw.userName
        ? String(raw.userName)
        : nestedUser?.name
          ? String(nestedUser.name)
          : undefined,
    shift_id: String(raw.shift_id ?? ""),
    start_time: raw.start_time ? String(raw.start_time) : undefined,
    end_time: raw.end_time ? String(raw.end_time) : undefined,
    work_date: String(raw.work_date ?? ""),
    assigned_by: raw.assigned_by ? String(raw.assigned_by) : undefined,
    note: raw.note ? String(raw.note) : undefined,
    status: String(raw.status ?? "ASSIGNED") as ShiftAssignmentStatus,
    is_deleted: Boolean(raw.is_deleted),
    created_at: raw.created_at ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at ? String(raw.updated_at) : undefined,
  };
};

const toRow = (raw: ShiftAssignmentItem): ShiftAssignmentItem => ({
  id: String(raw.id),
  user_id: String(raw.user_id),
  user_name: raw.user_name,
  shift_id: String(raw.shift_id),
  start_time: raw.start_time,
  end_time: raw.end_time,
  work_date: String(raw.work_date),
  assigned_by: raw.assigned_by,
  assigned_by_name: raw.assigned_by_name,
  note: raw.note,
  status: (raw.status ?? "ASSIGNED") as ShiftAssignmentStatus,
  is_deleted: Boolean(raw.is_deleted),
  created_at: raw.created_at,
  updated_at: raw.updated_at,
});

const mergeShiftAssignmentItem = (
  fallback: ShiftAssignmentItem,
  detail: ShiftAssignmentItem | null,
): ShiftAssignmentItem => {
  if (!detail) return { ...fallback };

  return {
    ...fallback,
    ...detail,
    user_name: detail.user_name ?? fallback.user_name,
    start_time: detail.start_time ?? fallback.start_time,
    end_time: detail.end_time ?? fallback.end_time,
    assigned_by: detail.assigned_by ?? fallback.assigned_by,
    assigned_by_name: detail.assigned_by_name ?? fallback.assigned_by_name,
    note: detail.note ?? fallback.note,
    created_at: detail.created_at ?? fallback.created_at,
    updated_at: detail.updated_at ?? fallback.updated_at,
  };
};

const getAssignedByDisplayName = (
  payload: Record<string, unknown>,
  fallbackId: string,
) => {
  const data = (payload?.data ?? payload) as Record<string, unknown>;
  return String(
    data?.name ??
      data?.full_name ??
      data?.fullName ??
      data?.username ??
      data?.email ??
      fallbackId,
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const defaultSearch = {
  shift_id: "",
  user_id: "",
  work_date: "",
  assigned_by: "",
  status: "",
  is_deleted: false,
};

const ShiftAssignmentPage = () => {
  const [data, setData] = useState<ShiftAssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [searchCondition, setSearchCondition] = useState(defaultSearch);

  // Modal open states
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Modal data
  const [detailItem, setDetailItem] = useState<ShiftAssignmentItem | null>(
    null,
  );
  const [statusItem, setStatusItem] = useState<ShiftAssignmentItem | null>(
    null,
  );
  const [nextStatus, setNextStatus] =
    useState<ShiftAssignmentStatus>("ASSIGNED");
  const [createForm, setCreateForm] = useState<ShiftAssignmentCreatePayload>({
    user_id: "",
    shift_id: "",
    work_date: today,
    note: "",
  });
  const [bulkItems, setBulkItems] = useState<ShiftAssignmentBulkRow[]>([
    { user_id: "", shift_id: "", work_date: today, note: "" },
  ]);

  // ── Data loading ──────────────────────────────────────────────────────────

  const loadData = async (cond = searchCondition) => {
    setLoading(true);
    try {
      const payload: ShiftAssignmentSearchPayload = {
        searchCondition: {
          ...cond,
          status: (cond.status || "") as ShiftAssignmentStatus | "",
          is_deleted: Boolean(cond.is_deleted),
        },
        pageInfo: { pageNum: 1, pageSize: 200 },
      };
      const res = await shiftAssignment03Service(payload);
      const items = extractArray(res).map(toRow);
      setData(items);

      const missingIds = [
        ...new Set(
          items
            .filter((entry) => entry.assigned_by && !entry.assigned_by_name)
            .map((entry) => entry.assigned_by!),
        ),
      ];

      if (missingIds.length > 0) {
        const nameMap: Record<string, string> = {};

        await Promise.allSettled(
          missingIds.map(async (id) => {
            try {
              const response = (await userApi.getById(id)) as Record<
                string,
                unknown
              >;
              nameMap[id] = getAssignedByDisplayName(response, id);
            } catch {
              /* ignore */
            }
          }),
        );

        setData((prev) =>
          prev.map((entry) => ({
            ...entry,
            assigned_by_name: entry.assigned_by
              ? (nameMap[entry.assigned_by] ?? entry.assigned_by)
              : undefined,
          })),
        );
      }
    } catch {
      toastError("Không thể tải danh sách phân ca");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSearchSubmit = () => void loadData(searchCondition);

  const handleResetSearch = () => {
    setSearchCondition(defaultSearch);
    void loadData(defaultSearch);
  };

  const handleCreate = async () => {
    if (!createForm.user_id || !createForm.shift_id || !createForm.work_date) {
      toastError("Vui lòng nhập đủ User ID, Shift ID và ngày làm");
      return;
    }
    try {
      await shiftAssignment01Service(createForm);
      toastSuccess("Đăng ký ca thành công");
      setCreateOpen(false);
      setCreateForm({ user_id: "", shift_id: "", work_date: today, note: "" });
      await loadData();
    } catch {
      toastError("Đăng ký ca thất bại");
    }
  };

  const handleBulkCreate = async () => {
    if (bulkItems.some((x) => !x.user_id || !x.shift_id || !x.work_date)) {
      toastError("Bulk còn thiếu dữ liệu, vui lòng kiểm tra lại");
      return;
    }
    try {
      await shiftAssignment02Service({ items: bulkItems });
      toastSuccess("Tạo lịch phân ca hàng loạt thành công");
      setBulkOpen(false);
      setBulkItems([{ user_id: "", shift_id: "", work_date: today, note: "" }]);
      await loadData();
    } catch {
      toastError("Tạo lịch phân ca hàng loạt thất bại");
    }
  };

  const handleView = async (item: ShiftAssignmentItem) => {
    setDetailItem(item);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await shiftAssignment04Service(item.id);
      const base = mergeShiftAssignmentItem(item, extractItem(res));

      if ((!base.start_time || !base.end_time) && base.shift_id) {
        try {
          const r = (await shiftGetByIdService(base.shift_id)) as Record<
            string,
            unknown
          >;
          const d = (r?.data ?? r) as Record<string, unknown>;
          if (!base.start_time) {
            base.start_time = String(d?.startTime ?? d?.start_time ?? "");
          }
          if (!base.end_time) {
            base.end_time = String(d?.endTime ?? d?.end_time ?? "");
          }
        } catch {
          /* ignore */
        }
      }

      if (base.assigned_by && !base.assigned_by_name) {
        try {
          const response = (await userApi.getById(base.assigned_by)) as Record<
            string,
            unknown
          >;
          base.assigned_by_name = getAssignedByDisplayName(
            response,
            base.assigned_by,
          );
        } catch {
          /* ignore */
        }
      }

      setDetailItem(base);
    } catch {
      setDetailItem(item);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenStatus = (item: ShiftAssignmentItem) => {
    setStatusItem(item);
    setNextStatus(item.status);
    setStatusOpen(true);
  };

  const handleChangeStatus = async () => {
    if (!statusItem) return;
    setStatusLoading(true);
    try {
      await shiftAssignment05Service(statusItem.id, { status: nextStatus });
      toastSuccess("Cập nhật trạng thái phân ca thành công");
      setStatusOpen(false);
      setStatusItem(null);
      await loadData();
    } catch {
      toastError("Cập nhật trạng thái thất bại");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: Column<ShiftAssignmentItem>[] = useMemo(
    () => [
      {
        header: "Nhân viên",
        accessor: "user_id",
        sortable: true,
        className: "min-w-[160px]",
        render: (item) => (
          <span className="font-medium text-gray-800">
            {item.user_name ?? item.user_id}
          </span>
        ),
      },
      {
        header: "Ca làm",
        accessor: "shift_id",
        sortable: true,
        className: "min-w-[140px]",
        render: (item) =>
          item.start_time && item.end_time ? (
            <span className="text-sm text-gray-700">
              {item.start_time} – {item.end_time}
            </span>
          ) : (
            <span className="text-sm text-gray-500">{item.shift_id}</span>
          ),
      },
      {
        header: "Ngày làm",
        accessor: "work_date",
        sortable: true,
      },
      {
        header: "Trạng thái",
        accessor: "status",
        render: (item) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadge(item.status)}`}
          >
            {item.status}
          </span>
        ),
      },
      {
        header: "Người phân ca",
        accessor: "assigned_by",
        render: (item) => item.assigned_by_name ?? item.assigned_by ?? "--",
      },
    ],
    [],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return <ClientLoading />;

  return (
    <div className="p-6 space-y-4 transition-all animate-fade-in">
      <ShiftAssignmentSearch
        searchCondition={searchCondition}
        setSearchCondition={setSearchCondition}
        onSearch={handleSearchSubmit}
        onReset={handleResetSearch}
        onReload={() => void loadData()}
      />

      <CRUDTable<ShiftAssignmentItem>
        title="Danh sách phân ca"
        data={data}
        columns={columns}
        pageSize={10}
        onView={handleView}
        onEdit={handleOpenStatus}
        searchKeys={["user_name", "user_id", "shift_id", "work_date", "status"]}
        filters={[
          {
            key: "status",
            label: "trạng thái",
            options: STATUS_OPTIONS.map((s) => ({ value: s, label: s })),
          },
        ]}
        searchRight={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Plus size={14} />
              Phân ca
            </button>
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CalendarPlus size={14} />
              Phân ca hàng loạt
            </button>
          </div>
        }
      />

      <ShiftAssignmentModals
        createOpen={createOpen}
        setCreateOpen={setCreateOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onCreateSubmit={() => void handleCreate()}
        bulkOpen={bulkOpen}
        setBulkOpen={setBulkOpen}
        bulkItems={bulkItems}
        setBulkItems={setBulkItems}
        onBulkSubmit={() => void handleBulkCreate()}
        statusOpen={statusOpen}
        setStatusOpen={setStatusOpen}
        nextStatus={nextStatus}
        setNextStatus={setNextStatus}
        onStatusSubmit={() => void handleChangeStatus()}
        detailOpen={detailOpen}
        setDetailOpen={setDetailOpen}
        detailItem={detailItem}
        detailLoading={detailLoading}
        statusLoading={statusLoading}
      />
    </div>
  );
};

export default ShiftAssignmentPage;
