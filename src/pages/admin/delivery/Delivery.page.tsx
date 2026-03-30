/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { CircleCheckBig, Search } from "lucide-react";

import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import ClientLoading from "@/components/Client/Client.Loading";
import FranchiseSelector from "@/pages/admin/cart/components/FranchiseSelector";
import OrderStatusForm from "@/components/order/orderStatusForm";
import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import { getOrderDetail } from "@/components/order/services/getOrder.service";

import type { Franchise } from "@/components/categoryFranchise/models/franchise08.model";
import type { Order } from "@/pages/admin/order/models/searchOrderResponse.model";
import { useAdminContextStore, useAuthStore } from "@/stores";
import {
  type DeliveryOrderItem,
  searchDeliveries,
} from "./services/searchDelivery.service";

const DEFAULT_STATUS = "ASSIGNED";

const STATUS_FILTERS = [
  { value: "ASSIGNED", label: "Đã xác nhận" },
  { value: "PICKING_UP", label: "Đang lấy hàng" },
  { value: "DELIVERED", label: "Đã giao" },
];

const CHANGEABLE_STATUSES = new Set(["ASSIGNED", "PICKING_UP"]);

const getRoleCodes = (
  roles: Array<{ role?: string; role_code?: string }> = [],
) =>
  roles
    .map((role) => String(role.role ?? role.role_code ?? "").toUpperCase())
    .filter(Boolean);

const getRoleFranchiseIds = (
  roles: Array<{
    franchise_id?: string | null;
    franchiseId?: string | null;
  }> = [],
) =>
  Array.from(
    new Set(
      roles
        .map((role) =>
          String(role.franchise_id ?? role.franchiseId ?? "").trim(),
        )
        .filter(Boolean),
    ),
  );

const getFranchiseKey = (franchise?: Franchise | null): string => {
  if (!franchise) return "";
  return String(franchise.value ?? franchise.id ?? franchise.code ?? "");
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    ASSIGNED: "Đã xác nhận",
    PICKING_UP: "Đang lấy hàng",
    DELIVERED: "Đã giao",
  };
  return map[status] || status;
};

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    ASSIGNED: "bg-blue-100 text-blue-700",
    PICKING_UP: "bg-amber-100 text-amber-700",
    DELIVERED: "bg-green-100 text-green-700",
  };
  return map[status] || "bg-gray-200 text-gray-600";
};

const sortByCreatedAtDesc = (orders: DeliveryOrderItem[]) =>
  [...orders].sort((a, b) => {
    const aTime = new Date(a.created_at || 0).getTime();
    const bTime = new Date(b.created_at || 0).getTime();
    return bTime - aTime;
  });

const renderCreatedAt = (value: string) => (
  <div className="text-sm text-gray-500">
    {value ? new Date(value).toLocaleDateString("vi-VN") : "-"}
    <div className="text-xs text-gray-400">
      {value ? new Date(value).toLocaleTimeString("vi-VN") : ""}
    </div>
  </div>
);

type SearchForm = {
  status: string;
  customer_keyword: string;
};

const DeliveryPage = () => {
  const user = useAuthStore((s) => s.user);
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );
  const currentUserId = String(user?.id ?? "").trim();

  const roleCodes = useMemo(
    () => getRoleCodes(user?.roles || []),
    [user?.roles],
  );
  const roleFranchiseIds = useMemo(
    () => getRoleFranchiseIds(user?.roles || []),
    [user?.roles],
  );

  const isAdminRole = roleCodes.includes("ADMIN");
  const isManager = !isAdminRole && roleCodes.includes("MANAGER");
  const isStaffOrShipper =
    !isAdminRole &&
    (roleCodes.includes("STAFF") || roleCodes.includes("SHIPPER"));

  const effectiveFranchiseId = useMemo(() => {
    const selected = String(selectedFranchiseId ?? "").trim();
    if (selected) return selected;
    if (isAdminRole) return "";
    return roleFranchiseIds[0] ?? "";
  }, [isAdminRole, roleFranchiseIds, selectedFranchiseId]);

  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<DeliveryOrderItem[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [orderForStatus, setOrderForStatus] = useState<Order | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loadingFranchises, setLoadingFranchises] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(
    null,
  );

  const { register, handleSubmit, reset, watch } = useForm<SearchForm>({
    defaultValues: {
      status: DEFAULT_STATUS,
      customer_keyword: "",
    },
  });

  useEffect(() => {
    if (!isAdminRole || selectedFranchiseId) return;

    const loadFranchises = async () => {
      setLoadingFranchises(true);
      try {
        const data = await getAllFranchises();
        setFranchises(data || []);
      } catch (error) {
        console.error("Lỗi tải danh sách chi nhánh:", error);
      } finally {
        setLoadingFranchises(false);
      }
    };

    loadFranchises();
  }, [isAdminRole, selectedFranchiseId]);

  const resolveAdminFranchiseId = () => {
    if (selectedFranchiseId) return selectedFranchiseId;
    if (!isAdminRole) return effectiveFranchiseId;
    return getFranchiseKey(selectedFranchise);
  };

  const fetchDeliveries = useCallback(
    async (status = "", customerKeyword = "", page = 1, size = pageSize) => {
      const franchiseIdForSearch = resolveAdminFranchiseId();

      if (isManager && !effectiveFranchiseId) {
        setOrders([]);
        setTotalItems(0);
        return;
      }

      if (isAdminRole && !selectedFranchiseId && !franchiseIdForSearch) {
        setOrders([]);
        setTotalItems(0);
        return;
      }

      if (isStaffOrShipper && !currentUserId) {
        setOrders([]);
        setTotalItems(0);
        return;
      }

      setLoading(true);
      try {
        const payload = {
          franchise_id: isManager || isAdminRole ? franchiseIdForSearch : "",
          staff_id: isStaffOrShipper ? currentUserId : "",
          customer_id: "",
          status,
        };

        const response = await searchDeliveries(payload);
        const normalizedKeyword = customerKeyword.trim().toLowerCase();
        const sorted = sortByCreatedAtDesc(response);
        const filteredByName = !normalizedKeyword
          ? sorted
          : sorted.filter((item) =>
              String(item.customer_name ?? "")
                .toLowerCase()
                .includes(normalizedKeyword),
            );

        if (isAdminRole) {
          setTotalItems(filteredByName.length);
          const start = (page - 1) * size;
          setOrders(filteredByName.slice(start, start + size));
          return;
        }

        setOrders(filteredByName);
        setTotalItems(filteredByName.length);
      } catch (error) {
        console.error("Lỗi tìm đơn giao hàng:", error);
        toast.error("Không thể tải danh sách đơn giao hàng");
        setOrders([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [
      pageSize,
      isManager,
      effectiveFranchiseId,
      isAdminRole,
      selectedFranchiseId,
      selectedFranchise,
      isStaffOrShipper,
      currentUserId,
    ],
  );

  const onSearchSubmit = handleSubmit(async (values) => {
    setCurrentPage(1);
    await fetchDeliveries(values.status, values.customer_keyword, 1, pageSize);
  });

  const handleRefresh = async () => {
    reset({ status: DEFAULT_STATUS, customer_keyword: "" });
    setCurrentPage(1);
    await fetchDeliveries(DEFAULT_STATUS, "", 1, pageSize);
  };

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    await fetchDeliveries(
      watch("status"),
      watch("customer_keyword"),
      page,
      pageSize,
    );
  };

  const handlePageSizeChange = async (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    await fetchDeliveries(watch("status"), watch("customer_keyword"), 1, size);
  };

  useEffect(() => {
    if (isAdminRole && !selectedFranchiseId && !selectedFranchise) return;
    fetchDeliveries(DEFAULT_STATUS, "", 1, pageSize);
  }, [
    isAdminRole,
    selectedFranchiseId,
    selectedFranchise,
    isStaffOrShipper,
    currentUserId,
  ]);

  const canShowActionButton = (item: DeliveryOrderItem) => {
    const assignedToCurrentUser =
      Boolean(item.assigned_to) &&
      Boolean(currentUserId) &&
      String(item.assigned_to) === String(currentUserId);

    if (isStaffOrShipper) {
      return assignedToCurrentUser && CHANGEABLE_STATUSES.has(item.status);
    }

    return CHANGEABLE_STATUSES.has(item.status);
  };

  const openStatusModal = async (item: DeliveryOrderItem) => {
    if (!canShowActionButton(item)) {
      return;
    }

    try {
      const targetOrderId = item.order_id || item._id;
      const detail = await getOrderDetail(targetOrderId);
      const order = detail?.success && detail?.data ? detail.data : null;
      if (!order) {
        toast.error("Không lấy được chi tiết đơn hàng");
        return;
      }

      setOrderForStatus(order);
      setIsStatusModalOpen(true);
    } catch (error) {
      console.error("Lỗi tải chi tiết đơn:", error);
      toast.error("Không lấy được chi tiết đơn hàng");
    }
  };

  const handleStatusChangeSuccess = async () => {
    await fetchDeliveries(
      watch("status"),
      watch("customer_keyword"),
      currentPage,
      pageSize,
    );
  };

  const columns: Column<DeliveryOrderItem>[] = [
    {
      header: "Mã đơn",
      accessor: "code",
      className: "min-w-[140px]",
      render: (item) => (
        <span className="font-mono font-medium text-gray-700">{item.code}</span>
      ),
    },
    {
      header: "Khách hàng",
      accessor: "customer_name",
      className: "min-w-[180px]",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-800">
            {item.customer_name || "-"}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {item.phone || "-"}
          </div>
        </div>
      ),
    },
    {
      header: "Nhân viên giao",
      accessor: "assigned_to_name",
      className: "min-w-[170px]",
      render: (item) => (
        <span className="text-gray-700">{item.assigned_to_name || "-"}</span>
      ),
    },
    {
      header: "Ngày tạo",
      accessor: "created_at",
      sortable: true,
      className: "min-w-[140px]",
      render: (item) => renderCreatedAt(item.created_at),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      className: "min-w-[120px]",
      render: (item) => (
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColor(item.status)}`}
        >
          {statusLabel(item.status)}
        </span>
      ),
    },
  ];

  if (isAdminRole && !selectedFranchiseId && !selectedFranchise) {
    return (
      <FranchiseSelector
        data={franchises}
        loading={loadingFranchises}
        onSelect={(id) => {
          const selected =
            franchises.find((item) => getFranchiseKey(item) === id) || null;
          setSelectedFranchise(selected);
        }}
      />
    );
  }

  if (loading && orders.length === 0) {
    return <ClientLoading />;
  }

  const statusOptions = STATUS_FILTERS;

  return (
    <>
      {isAdminRole ? (
        <CRUDPageTemplate
          title={
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setSelectedFranchise(null);
                }}
                className="flex items-center gap-1 px-3 hover:bg-gray-100"
              >
                ←
              </button>

              <span>
                {selectedFranchise
                  ? `Danh sách vận chuyển - ${selectedFranchise.name}`
                  : "Danh sách vận chuyển"}
              </span>
            </div>
          }
          data={orders}
          columns={columns}
          pageSize={pageSize}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          isTableLoading={loading}
          onSearch={async (term, filters) => {
            const status = String(filters?.status ?? DEFAULT_STATUS);
            const customerKeyword = String(term ?? "").trim();
            setCurrentPage(1);
            reset({ status, customer_keyword: customerKeyword });
            await fetchDeliveries(status, customerKeyword, 1, pageSize);
          }}
          onRefresh={handleRefresh}
          onChangeOrderStatus={openStatusModal}
          canChangeOrderStatus={canShowActionButton}
          filters={
            [
              {
                key: "status",
                label: "Trạng thái",
                defaultValue: DEFAULT_STATUS,
                options: statusOptions,
              },
            ] as any
          }
        />
      ) : (
        <div className="p-5 md:p-8">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Danh sách đơn giao hàng
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isManager
                    ? "Manager đang xem đơn theo chi nhánh"
                    : "Staff/Shipper đang xem đơn theo tài khoản đăng nhập"}
                </p>
              </div>

              <form
                onSubmit={onSearchSubmit}
                className="flex flex-col sm:flex-row gap-2"
              >
                <select
                  {...register("status")}
                  title="Lọc trạng thái"
                  className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700"
                >
                  <option value="">Tất cả trạng thái</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <input
                  {...register("customer_keyword")}
                  type="text"
                  placeholder="Nhập tên khách hàng"
                  className="h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-700"
                />

                <button
                  type="submit"
                  className="h-10 px-4 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Tìm kiếm
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="h-10 px-4 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Làm mới
                </button>
              </form>
            </div>

            <div className="overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                      Nhân viên giao
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-left text-xs uppercase text-gray-500">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-xs uppercase text-gray-500">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-sm text-gray-500"
                      >
                        Không có đơn giao hàng
                      </td>
                    </tr>
                  ) : (
                    orders.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-gray-700">
                          {item.code || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>{item.customer_name || "-"}</div>
                          <div className="text-xs text-gray-500">
                            {item.phone || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.assigned_to_name || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {renderCreatedAt(item.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(item.status)}`}
                          >
                            {statusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {canShowActionButton(item) && (
                            <button
                              type="button"
                              title="Đổi trạng thái"
                              onClick={() => openStatusModal(item)}
                              className="inline-flex items-center gap-1 p-2 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer"
                            >
                              <CircleCheckBig className="w-5 h-5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <OrderStatusForm
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        order={orderForStatus}
        onSuccess={handleStatusChangeSuccess}
        franchiseId={resolveAdminFranchiseId() || effectiveFranchiseId || ""}
      />
    </>
  );
};

export default DeliveryPage;
