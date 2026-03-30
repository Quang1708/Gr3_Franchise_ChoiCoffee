/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState, useRef } from "react";
import {
  CRUDPageTemplate,
  type Column,
} from "@/components/Admin/template/CRUDPage.template";
import { searchCustomersUsecase } from "../customer/usecases/searchCustomers.usecase";

import type { Customer } from "@/models/customer.model";
import type {
  OrderByFranchise,
  Order,
} from "./models/searchOrderResponse.model";
import {
  searchOrderByFranchiseId,
  searchOrdersByCustomer,
} from "./services/searchOrder.service";
import FormSelect from "@/components/Admin/Form/FormSelect";
import ClientLoading from "@/components/Client/Client.Loading";
import OrderForm from "@/components/order/orderForm";
import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import type { Franchise } from "@/components/categoryFranchise/models/franchise08.model";
import { useAdminContextStore } from "@/stores";
import OrderStatusForm from "@/components/order/orderStatusForm";
import FranchiseSelector from "@/pages/admin/cart/components/FranchiseSelector";
import { getOrderDetail } from "@/components/order/services/getOrder.service";
import { useForm } from "react-hook-form";

const OrderPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerCache, setCustomerCache] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderByFranchise[]>([]);
  const [customerSelected, setCustomerSelected] = useState<Customer | null>(
    null,
  );
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("view");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(
    null,
  );
  const [loadingFranchises, setLoadingFranchises] = useState(false);
  const franchise_id = useAdminContextStore((s) => s.selectedFranchiseId);
  const isAdmin = !franchise_id;
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // State cho search customer
  const [customerSearchKey, setCustomerSearchKey] = useState("");
  // State cho filter hiện tại
  const [currentFilterStatus, setCurrentFilterStatus] =
    useState<string>("CONFIRMED");

  // Key để force remount CRUDPageTemplate (cập nhật filter UI)
  const [filterKey, setFilterKey] = useState(0);

  // Ref để tránh fetch nhiều lần
  const isFetching = useRef(false);
  const isRefreshing = useRef(false);

  // Fake useForm
  const { register: customerRegister } = useForm();

  const getFranchiseKey = (franchise?: Franchise | null): string => {
    if (!franchise) return "";
    return String(franchise.value ?? franchise.id ?? franchise.code ?? "");
  };

  // Sắp xếp order theo ngày tạo
  const sortOrdersByDate = (
    ordersList: OrderByFranchise[],
  ): OrderByFranchise[] => {
    return [...ordersList].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  };

  // Load danh sách chi nhánh
  useEffect(() => {
    if (!isAdmin) return;
    const loadFranchises = async () => {
      setLoadingFranchises(true);
      try {
        const data = await getAllFranchises();
        if (data) setFranchises(data);
      } catch (error) {
        console.error("Error fetching franchises:", error);
      } finally {
        setLoadingFranchises(false);
      }
    };
    loadFranchises();
  }, [isAdmin]);

  // Nếu là Manager, tự động set chi nhánh
  useEffect(() => {
    if (!isAdmin && franchise_id) {
      setSelectedFranchise({
        id: franchise_id,
        value: franchise_id,
        name: "Chi nhánh của bạn",
      } as Franchise);
    }
  }, [isAdmin, franchise_id]);

  // Hàm tìm kiếm khách hàng
  const searchCustomers = useCallback(async (keyword: string) => {
    if (!keyword || keyword.length < 2) {
      setCustomerCache([]);
      return;
    }

    try {
      const res = await searchCustomersUsecase({
        searchCondition: {
          keyword: keyword,
          is_active: "",
          is_deleted: false,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 20,
        },
      });

      if (res.success) {
        setCustomerCache(res.data);
      } else {
        setCustomerCache([]);
      }
    } catch (error) {
      console.error("Lỗi tìm kiếm khách hàng:", error);
      setCustomerCache([]);
    }
  }, []);

  // Load danh sách khách hàng ban đầu
  const loadInitialCustomers = useCallback(async () => {
    try {
      const res = await searchCustomersUsecase({
        searchCondition: {
          keyword: "",
          is_active: "",
          is_deleted: false,
        },
        pageInfo: {
          pageNum: 1,
          pageSize: 50,
        },
      });

      if (res.success) {
        setCustomerCache(res.data);
      }
    } catch (error) {
      console.error("Lỗi load khách hàng:", error);
    }
  }, []);

  useEffect(() => {
    loadInitialCustomers();
  }, []);

  useEffect(() => {
    if (customerSearchKey && customerSearchKey.length >= 2) {
      searchCustomers(customerSearchKey);
    } else if (customerSearchKey === "") {
      loadInitialCustomers();
    }
  }, [customerSearchKey]);
  // Hàm fetch order theo franchise
  const fetchOrdersByFranchise = useCallback(
    async (status?: string, page: number = 1, size: number = pageSize) => {
      const targetFranchiseId = isAdmin
        ? getFranchiseKey(selectedFranchise)
        : franchise_id;
      if (!targetFranchiseId) return;

      setLoading(true);
      try {
        // Nếu status là "" (tất cả), truyền undefined để API lấy tất cả

        const res = await searchOrderByFranchiseId(targetFranchiseId, status);
        if (res) {
          const allData: OrderByFranchise[] = Array.isArray(res)
            ? res
            : res?.data || [];
          const sortedData = sortOrdersByDate(allData);
          setTotalItems(sortedData.length);
          const startIndex = (page - 1) * size;
          setOrders(sortedData.slice(startIndex, startIndex + size));
        } else {
          setOrders([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
        isFetching.current = false;
        isRefreshing.current = false;
      }
    },
    [
      selectedFranchise,
      franchise_id,
      pageSize,
      !isAdmin,
      isAdmin,
      currentFilterStatus,
    ],
  );

  

  // Hàm fetch order theo khách hàng
  const fetchOrdersByCustomer = useCallback(
    async (
      customerId: string,
      status?: string,
      page: number = 1,
      size: number = pageSize,
    ) => {
      setLoading(true);
      try {
        const res = await searchOrdersByCustomer(customerId, status);
        if (res) {
          let allData: Order[] = Array.isArray(res) ? res : res?.data || [];
          if (status && status !== "") {
            allData = allData.filter((item) => item.status === status);
          }
          const convertedData: OrderByFranchise[] = allData.map((item) => ({
            _id: item._id,
            customer_id: item.customer_id,
            code: item.code,
            status: item.status,
            phone: (item as any).phone || "",
            subtotal_amount: item.subtotal_amount,
            final_amount: item.final_amount,
            customer_name: item.customer_name,
            created_at: (item as any).created_at || new Date().toISOString(),
          }));
          const sortedData = sortOrdersByDate(convertedData);
          setTotalItems(sortedData.length);
          const startIndex = (page - 1) * size;
          setOrders(sortedData.slice(startIndex, startIndex + size));
        } else {
          setOrders([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    },
    [pageSize],
  );

  // Hàm xử lý tìm kiếm - khi bấm nút Tìm kiếm
  const handleSearch = useCallback(
    async (term: string, filters?: any) => {
      term = term.trim();
      if (isFetching.current) return;
      isFetching.current = true;

      // status là giá trị từ filter (có thể là "" khi chọn "Tất cả")
      const status = filters?.status;
      setCurrentFilterStatus(status !== undefined ? status : "CONFIRMED");
      setCurrentPage(1);
      setFilterKey((prev) => prev + 1);

      if (customerSelected?.id) {
        await fetchOrdersByCustomer(customerSelected.id, status, 1, pageSize);
      } else {
        await fetchOrdersByFranchise(status, 1, pageSize);
      }
    },
    [customerSelected, fetchOrdersByCustomer, fetchOrdersByFranchise, pageSize],
  );
  // Load lần đầu khi có chi nhánh
  useEffect(() => {
    if (selectedFranchise && !customerSelected && !isFetching.current) {
      isFetching.current = true;
      fetchOrdersByFranchise("CONFIRMED", 1, pageSize);
    }
  }, [selectedFranchise]);

  // Xử lý khi đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const status = currentFilterStatus === "" ? undefined : currentFilterStatus;
    if (customerSelected?.id) {
      fetchOrdersByCustomer(customerSelected.id, status, page, pageSize);
    } else {
      fetchOrdersByFranchise(status, page, pageSize);
    }
  };

  // Xử lý khi đổi số lượng mỗi trang
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    const status = currentFilterStatus === "" ? undefined : currentFilterStatus;
    if (customerSelected?.id) {
      fetchOrdersByCustomer(customerSelected.id, status, 1, size);
    } else {
      fetchOrdersByFranchise(status, 1, size);
    }
  };

  // Xử lý refresh - reset về mặc định
  const handleRefresh = async () => {
    setCurrentPage(1);
    setCustomerSelected(null);
    setCustomerSearchKey("");
    setCurrentFilterStatus("CONFIRMED");

    setFilterKey((prev) => prev + 1);

    const targetFranchiseId = isAdmin
      ? getFranchiseKey(selectedFranchise)
      : franchise_id;

    if (targetFranchiseId) {
      await fetchOrdersByFranchise("CONFIRMED", 1, pageSize);
    }
  };

  // Lấy chi tiết order
  const getOrderDetailForModal = useCallback(
    async (orderId: string): Promise<Order | null> => {
      try {
        const response = await getOrderDetail(orderId);
        return response?.success && response?.data ? response.data : null;
      } catch (error) {
        console.error("Lỗi:", error);
        return null;
      }
    },
    [],
  );

  const statusLabels = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: "Nháp",
      CONFIRMED: "Đã xác nhận",
      PREPARING: "Đang chuẩn bị",
      READY_FOR_PICKUP: "Sẵn sàng",
      OUT_FOR_DELIVERY: "Đang giao",
      COMPLETED: "Hoàn tất",
      CANCELED: "Đã hủy",
    };
    return map[status] || status;
  };

  const statusColors = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: "bg-gray-200 text-gray-500",
      CONFIRMED: "bg-blue-200 text-blue-500",
      PREPARING: "bg-orange-200 text-orange-500",
      READY_FOR_PICKUP: "bg-teal-200 text-teal-500",
      OUT_FOR_DELIVERY: "bg-purple-200 text-purple-500",
      COMPLETED: "bg-green-200 text-green-500",
      CANCELED: "bg-red-200 text-red-500",
    };
    return map[status] || "bg-gray-200 text-gray-500";
  };

  const columns: Column<OrderByFranchise>[] = [
    {
      header: "Mã đơn",
      accessor: "code",
      className: "min-w-[150px]",
      render: (item) => (
        <span className="font-mono text-[14px] font-medium text-gray-700">
          {item.code}
        </span>
      ),
    },
    {
      header: "Khách hàng",
      accessor: "customer_name",
      className: "min-w-[180px]",
      render: (item) => (
        <div>
          <div className="font-medium text-gray-800">{item.customer_name}</div>
          {item.phone && (
            <div className="text-xs text-gray-400 mt-0.5">{item.phone}</div>
          )}
        </div>
      ),
    },
    {
      header: "Tổng tiền",
      accessor: "final_amount",
      sortable: true,
      className: "min-w-[130px]",
      render: (item) => (
        <div className="font-semibold text-primary">
          {item.final_amount?.toLocaleString("vi-VN")}đ
        </div>
      ),
    },
    {
      header: "Ngày tạo",
      accessor: "created_at",
      sortable: true,
      className: "min-w-[150px]",
      render: (item) => (
        <div className="text-sm text-gray-500">
          {new Date(item.created_at).toLocaleDateString("vi-VN")}
          <div className="text-xs text-gray-400">
            {new Date(item.created_at).toLocaleTimeString("vi-VN")}
          </div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      className: "min-w-[120px]",
      render: (item) => (
        <span
          className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors(item.status)}`}
        >
          {statusLabels(item.status)}
        </span>
      ),
    },
  ];

  const handleOpenForm = async (
    mode: "create" | "edit" | "view",
    data?: OrderByFranchise,
  ) => {
    if ((mode === "view" || mode === "edit") && data) {
      const orderDetail = await getOrderDetailForModal(data._id);
      if (orderDetail) {
        setSelectedOrder(orderDetail);
        setFormMode(mode);
        setIsModalOpen(true);
      }
    } else {
      setFormMode(mode);
      setSelectedOrder(null);
      setIsModalOpen(true);
    }
  };

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [orderForStatus, setOrderForStatus] = useState<Order | null>(null);

  const handleChangeOrderStatus = async (item: OrderByFranchise) => {
    const orderDetail = await getOrderDetailForModal(item._id);
    if (orderDetail) {
      setOrderForStatus(orderDetail);
      setIsStatusModalOpen(true);
    }
  };

  const handleStatusChangeSuccess = (newStatus?: string) => {
    setCurrentPage(1);
    if (newStatus) {
      setCurrentFilterStatus(newStatus);
      if (customerSelected?.id) {
        fetchOrdersByCustomer(customerSelected.id, newStatus, 1, pageSize);
      } else {
        fetchOrdersByFranchise(newStatus, 1, pageSize);
      }
    } else {
      const status =
        currentFilterStatus === "" ? undefined : currentFilterStatus;
      if (customerSelected?.id) {
        fetchOrdersByCustomer(customerSelected.id, status, 1, pageSize);
      } else {
        fetchOrdersByFranchise(status, 1, pageSize);
      }
    }
  };

  // Admin chưa chọn chi nhánh
  if (isAdmin && !selectedFranchise) {
    return (
      <FranchiseSelector
        data={franchises}
        loading={loadingFranchises}
        onSelect={(id) => {
          const f = franchises.find((x) => getFranchiseKey(x) === id);
          if (f) setSelectedFranchise(f);
        }}
      />
    );
  }

  if (loading) return <ClientLoading />;

  const selectOptions = customerCache.map((c) => ({
    label: `${c.name}${c.phone ? ` (${c.phone})` : ""}`,
    value: c.id,
  }));

  return (
    <>
      <CRUDPageTemplate
        key={filterKey}
        title={
          selectedFranchise
            ? `Danh sách đơn hàng - ${selectedFranchise.name}`
            : "Danh sách đơn hàng"
        }
        data={orders}
        columns={columns}
        pageSize={pageSize}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onView={(item) => handleOpenForm("view", item)}
        isTableLoading={loading}
        onSearch={handleSearch}
        onEdit={(item) => handleOpenForm("edit", item)}
        canEdit={(item) => item.status === "DRAFT"}
        onChangeOrderStatus={handleChangeOrderStatus}
        canChangeOrderStatus={(item) =>
          [
            "CONFIRMED",
            "PREPARING",
            "READY_FOR_PICKUP",
            "OUT_FOR_DELIVERY",
            "COMPLETED",
          ].includes(item.status)
        }
        onRefresh={handleRefresh}
        searchContent={
          <div className="flex gap-4">
            <FormSelect
              register={customerRegister("customer")}
              value={customerSelected?.id || ""}
              placeholder="Chọn khách hàng"
              options={selectOptions}
              onChange={(id) => {
                const selectedCustomer = customerCache.find((c) => c.id === id);
                if (selectedCustomer) {
                  setCustomerSelected(selectedCustomer);
                  setCustomerSearchKey("");
                }
              }}
            />
          </div>
        }
        filters={[
          {
            key: "status" as const,
            label: "Trạng thái",
            defaultValue: currentFilterStatus,
            options: [
              { value: "DRAFT", label: "Nháp" },
              { value: "CONFIRMED", label: "Đã xác nhận" },
              { value: "PREPARING", label: "Đang chuẩn bị" },
              { value: "READY_FOR_PICKUP", label: "Sẵn sàng" },
              { value: "OUT_FOR_DELIVERY", label: "Đang giao" },
              { value: "COMPLETED", label: "Hoàn tất" },
              { value: "CANCELED", label: "Đã hủy" },
            ],
          },
        ]}
      />

      <OrderForm
        mode={formMode}
        isOpen={isModalOpen}
        initialData={selectedOrder || undefined}
        onSubmit={() => {}}
        onClose={() => setIsModalOpen(false)}
      />

      <OrderStatusForm
        franchiseId={franchise_id || selectedFranchise?.value || ""}
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        order={orderForStatus}
        onSuccess={handleStatusChangeSuccess}
      />
    </>
  );
};

export default OrderPage;
