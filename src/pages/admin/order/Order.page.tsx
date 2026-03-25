import { useCallback, useEffect, useState } from "react";
import { CRUDPageTemplate, type Column } from "@/components/Admin/template/CRUDPage.template";
import { searchCustomersUsecase } from "../customer/usecases/searchCustomers.usecase";

import type { Customer } from "@/models/customer.model";
import type { Order } from "./models/searchOrderResponse.model";
import { searchOrderByFranchiseId, searchOrdersByCustomer } from "./services/searchOrder.service";
import CustomSelect from "@/components/Admin/filters/CustomSelect";
import ClientLoading from "@/components/Client/Client.Loading";
import OrderForm from "@/components/order/orderForm";
import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import type { Franchise } from "@/components/categoryFranchise/models/franchise08.model";
import { useAdminContextStore } from "@/stores";
import OrderStatusForm from "@/components/order/orderStatusForm";

const OrderPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [customerCache, setCustomerCache] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerSelected, setCustomerSelected] = useState<Customer | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("view");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [franchiseSelected, setFranchiseSelected] = useState<Franchise | null>(null);
  const franchise_id = useAdminContextStore((s) => s.selectedFranchiseId) ;
  const isAdmin = !franchise_id;

  const getFranchiseKey = (franchise?: Franchise | null): string => {
    if (!franchise) return "";
    return String(franchise.value ?? franchise.id ?? franchise.code ?? "");
  };

  

  useEffect(() => {
    if (!isAdmin) return;
    const loadFranchises = async () => {
      try {
        const data = await getAllFranchises();
        if (data) setFranchises(data);
      } catch (error) {
        console.error("Error fetching franchises:", error);
      }
    };
    void loadFranchises();
  }, [isAdmin]);

  const franchiseOptions =
    franchises
      ?.map((f: Franchise) => ({
        label: f.name,
        value: getFranchiseKey(f),
      }))
      .filter((option) => Boolean(option.value)) || [];

  const fetchCustomers = async ({ pageNum, pageSize, searchKey }: any) => {
    try {

      const res = await searchCustomersUsecase({
        searchCondition: {
          keyword: searchKey || "",
          is_active: "",
          is_deleted: false
        },
        pageInfo: {
          pageNum,
          pageSize, // lấy nhiều hơn để dễ test
        }
      });

      if (res.success) {
        setCustomerCache((prev) => {
        const newItems = res.data.filter(
          (newItem: Customer) => !prev.some((oldItem) => oldItem.id === newItem.id)
        );
        return [...prev, ...newItems];
      });

      return {
        data: res.data.map((c: Customer) => ({ label: c.name, value: c.id })),
        pageInfo: res.pageInfo, // Trả về pageNum, pageSize, totalPages... cho component
      };
    }
    return { data: [], pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 0 } };
    } catch {
      console.log("Lỗi khi tải customer");
    } finally {
        setLoading(false);
    }
  };

    useEffect(() => {
        fetchCustomers({ pageNum: 1, pageSize: 10, searchKey: "" });
    }, [])

  
  const searchCart = useCallback(async (term: string, filters?: any) => {
    setLoading(true);
    const status = filters?.status;
    try {
      const targetFranchiseId = isAdmin ? getFranchiseKey(franchiseSelected) : franchise_id; 
      if (targetFranchiseId) {
        const res = await searchOrderByFranchiseId(targetFranchiseId, status);
        console.log(res);
        if (res) {
          let finalData = Array.isArray(res) ? res : res?.data || [];
          if (status) {
            finalData = finalData.filter((item: any) => item.status === status);
          }
          setOrders(finalData);
        }
      } else if (customerSelected?.id) {
        const res = await searchOrdersByCustomer(customerSelected.id, status);
        if (res) {
          const finalData = Array.isArray(res) ? res : res?.data || [];
          setOrders(finalData);
        }
      } else {
    
        setOrders([]);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, franchiseSelected, franchise_id, customerSelected]); 

  
useEffect(() => {
  const searchCart = async (term: string, filters?: any) => {
    setLoading(true);
    const status = filters?.status;
    try {
      const targetFranchiseId = isAdmin ? getFranchiseKey(franchiseSelected) : franchise_id; 
      if (targetFranchiseId) {
        const res = await searchOrderByFranchiseId(targetFranchiseId, status);
        console.log(res);
        if (res) {
          let finalData = Array.isArray(res) ? res : res?.data || [];
          if (status) {
            finalData = finalData.filter((item: any) => item.status === status);
          }
          setOrders(finalData);
        }
      } else if (customerSelected?.id) {
        const res = await searchOrdersByCustomer(customerSelected.id, status);
        if (res) {
          const finalData = Array.isArray(res) ? res : res?.data || [];
          setOrders(finalData);
        }
      } else {
    
        setOrders([]);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  }
  searchCart(franchise_id || "", { status: "" });
}, [franchise_id, isAdmin]);

    const statusLabels = (status: string) => {
  switch (status) {
    case "DRAFT": return "Nháp";
    case "CONFIRMED": return "Đã xác nhận";
    case "PREPARING": return "Đang chuẩn bị";
    case "READY_FOR_PICKUP": return "Sẵn sàng giao";
    case "OUT_FOR_DELIVERY": return "Đang giao";
    case "COMPLETED": return "Hoàn tất";
    case "CANCELED": return "Đã hủy";
    default: return status;
  }
};

const statusColors = (status: string) => {
  switch (status) {
    case "DRAFT":
      return "bg-gray-200 text-gray-500";
    case "CONFIRMED":
      return "bg-blue-200 text-blue-500";
    case "PREPARING":
      return "bg-orange-200 text-orange-500";
    case "READY_FOR_PICKUP":
      return "bg-teal-200 text-teal-500";
    case "OUT_FOR_DELIVERY":
      return "bg-purple-200 text-purple-500";
    case "COMPLETED":
      return "bg-green-200 text-green-500";
    case "CANCELED":
      return "bg-red-200 text-red-500";
    default:
      return "bg-gray-200 text-gray-500";
  }
};

  const columns: Column<Order>[] = [
    {
      header: "Mã đơn",
      accessor: "code",
      className: "min-w-[170px]",
    },
    {
      header: "Chi nhánh",
      accessor: "franchise_name",
      className: "min-w-[200px]",
    },
    {
      header: "Khách hàng",
      accessor: "customer_name",
      className: "min-w-[200px]",
    },

    {
      header: "Người tạo",
      accessor: "staff_name",
    },
    {
      header: "Tổng tiền",
      accessor: "final_amount",
      sortable: true,
      render: (item: Order) => (
        <span className="font-semibold text-primary">
          {item.final_amount.toLocaleString("vi-VN")} đ
        </span>
      ),
    },
    {
      header: "Trạng thái",
      accessor: "status",
      className: "flex items-center justify-center",
      render: (item: Order) => (
        <div className="flex items-center justify-center">
          <span
            className={`px-2 py-1 text-[10px] rounded-xl text-center inline-block min-w-20 font-medium ${statusColors(item.status)}`}
          >
            {statusLabels(item.status)}
          </span>
        </div>
      ),
    },
  ]; 

  const handleOpenForm = (mode: "create" | "edit" | "view", data?: Order) => {
    setFormMode(mode);
    setSelectedOrder(data || null);
    setIsModalOpen(true);
  };

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [orderForStatus, setOrderForStatus] = useState<Order | null>(null);

  if(loading) {
    return <ClientLoading />;
  }
  return (
    <>
      <CRUDPageTemplate
        title="Danh sách đơn hàng"
        data={orders}
        columns={columns}
        pageSize={5}
        onView={(item) => handleOpenForm("view", item)}
        isTableLoading={loading}
        searchKeys={["status"]}
        onSearch={searchCart}
        onEdit={(item) => handleOpenForm("edit", item)}
        canEdit={(item) => item.status === "DRAFT"}
        onChangeOrderStatus={(item) => {
          setOrderForStatus(item);
          setIsStatusModalOpen(true);
        }}
        canChangeOrderStatus={(item) =>
          item.status === "CONFIRMED" ||
          item.status === "PREPARING" ||
          item.status === "READY_FOR_PICKUP"||
          item.status === "OUT_FOR_DELIVERY"||
          item.status === "COMPLETED"
        }
        onRefresh={() => searchCart(orders?.[0]?.customer_id, { status: "" })}
        searchContent={
          <div className="flex gap-4">
            <CustomSelect
              fetchOptions={fetchCustomers as any}
              value={customerSelected?.id || ""}
              placeholder="Chọn khách hàng"
              onChange={(id) => {
                const selectedCustomer = customerCache.find((c) => c.id === id);
                setCustomerSelected(selectedCustomer || null);
              }}
            />
            {isAdmin && (
              <CustomSelect
                value={getFranchiseKey(franchiseSelected)}
                options={franchiseOptions}
                placeholder="Chọn chi nhánh"
                onChange={(id) => {
                  const selectedFranchise = franchises.find(
                    (f) => getFranchiseKey(f) === id,
                  );
                  setFranchiseSelected(selectedFranchise || null);
                }}
              />
            )}
          </div>
        }
        filters={[
          {
            key: "status",
            label: "Trạng thái",
            options: [
              { value: "DRAFT", label: "Nháp" },
              { value: "CONFIRMED", label: "Đã xác nhận" },
              { value: "PREPARING", label: "Đang chuẩn bị" },
              { value: "READY_FOR_PICKUP", label: "Sẵn sàng giao" },
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
      isOpen={isStatusModalOpen}
      onClose={() => setIsStatusModalOpen(false)}
      order={orderForStatus}
      onSuccess={() => searchCart("", { status: "" })} 
    />
    </>
  );
};

export default OrderPage;
