import { useEffect, useState } from "react";
import { type Column } from "@/components/Admin/template/CRUD.template";
import { searchCustomersUsecase } from "./usecases/searchCustomers.usecase";
import type { Customer } from "@/models/customer.model";
import ClientLoading from "@/components/Client/Client.Loading";
import { CRUDPageTemplate } from "@/components/Admin/template/CRUDPage.template";
import { updateCustomerStatusUsecase } from "@/pages/admin/customer/usecases/updateCustomerStatus.usecase";
import { deleteCustomerUsecase } from "@/pages/admin/customer/usecases/deleteCustomer.usecase";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import { restoreCustomerUsecase } from "@/pages/admin/customer/usecases/restoreCustomerUsecase";
import { useAuthStore } from "@/stores/auth.store";
import { CustomerForm, type CustomerFormValues } from "@/pages/admin/customer/components/CustomerForm";
import { createCustomerUsecase } from "@/pages/admin/customer/usecases/createCustomer.usecase";
import type { CustomerRequest } from "@/pages/admin/customer/models/customerRequest.model";

const CustomerPage = () => {
  const { user } = useAuthStore();
  const role = user?.roles?.[0]?.role;
  const isAdmin = role === "ADMIN";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "delete" | "restore";
    customer: Customer | null;
  }>({ isOpen: false, type: "delete", customer: null });
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal Form (Thêm/Sửa/Xem)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  console.log(selectedCustomer)

  // --- LOGIC MỞ FORM ---
  const handleOpenForm = (
    mode: "create" | "edit" | "view",
    customer: Customer | null = null
  ) => {
    setFormMode(mode);

    if (mode === "create") {
      setSelectedCustomer(null);
    } else {
      setSelectedCustomer(customer);
    }

    setIsFormOpen(true);
  };

  const handleSubmitCustomer = async (data: CustomerFormValues) => {
    try {
      setIsProcessing(true);

      const payload: CustomerRequest = {
        email: data.email,
        password: data.password || "",
        phone: data.phone,
        name: data.name,
        address: data.address,
        avatar_url: data.avatar_url,
      };

      if (formMode === "create") {
        const res = await createCustomerUsecase(payload);

        if (res?.success) {
          await fetchCustomers();
          setIsFormOpen(false);
        }
      }

    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: "Khách hàng",
      accessor: "name",
      className: "min-w-[250px] md:min-w-[350px]",
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0">

          <img
            src={item.avatar_url || "/images/default-avatar.png"}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover border border-black/10 flex-shrink-0"
          />

          <div className="flex flex-col min-w-0">
            <span className="font-medium text-gray-800 truncate">
              {item.name}
            </span>

            <span className="text-sm text-gray-500 truncate">
              {item.email}
            </span>
          </div>

        </div>
      ),
      sortable: true,
    },
    {
      header: "Số điện thoại",
      accessor: "phone",
    },
    {
      header: "Verified",
      accessor: "is_verified",
      render: (item) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${item.is_verified
            ? "bg-green-100 text-green-800"
            : "bg-gray-200 text-gray-500"
            }`}
        >
          {item.is_verified ? "Đã xác thực" : "Chưa xác thực"}
        </span>
      ),
    },
  ];

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await searchCustomersUsecase({
        keyword: "",
        pageNum: 1,
        pageSize: 10000,
      });
      if (res?.success) {
        setCustomers(res.data);
      }
    } catch (error) {
      console.error("Fetch customers failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusChange = async (customer: Customer, newStatus: boolean) => {
    try {
      const res = await updateCustomerStatusUsecase(customer.id, newStatus);
      if (res && (res.success || res.status === 200)) {
        setCustomers((prev) =>
          prev.map((c) =>
            String(c.id) === String(customer.id) ? { ...c, is_active: newStatus } : c
          )
        );
      } else {
        console.error("API trả về success: false", res);
      }
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  const handleDeleteClick = (customer: Customer) => {
    setModalConfig({ isOpen: true, type: "delete", customer });
  };

  const handleRestoreClick = (customer: Customer) => {
    setModalConfig({ isOpen: true, type: "restore", customer });
  };

  const handleConfirmAction = async () => {
    const { type, customer } = modalConfig;
    if (!customer) return;

    try {
      setIsProcessing(true);
      const res = type === "delete"
        ? await deleteCustomerUsecase(customer.id)
        : await restoreCustomerUsecase(customer.id);

      if (res?.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            String(c.id) === String(customer.id)
              ? { ...c, is_deleted: type === "delete" }
              : c
          )
        );
        setModalConfig({ ...modalConfig, isOpen: false });
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <ClientLoading />;
  }

  return (
    <>
      <CRUDPageTemplate<Customer>
        title="Quản lý khách hàng"
        data={customers}
        columns={columns}
        pageSize={5}
        isAdmin={isAdmin}
        statusField="is_active"
        onStatusChange={isAdmin ? handleStatusChange : undefined}
        searchKeys={["name", "email", "phone"]}
        filters={[
          {
            key: "is_active",
            label: "trạng thái",
            options: [
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" }
            ]
          }
        ]}
        onAdd={() => handleOpenForm("create")}
        onView={(item) => handleOpenForm("view", item)}
        onDelete={isAdmin ? handleDeleteClick : undefined}
        onRestore={isAdmin ? handleRestoreClick : undefined}
        onRefresh={fetchCustomers}
      />
      <CustomerForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={selectedCustomer || undefined}
        isLoading={isProcessing}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitCustomer}
      />

      <ActionConfirmModal
        isOpen={modalConfig.isOpen}
        type={modalConfig.type}
        isLoading={isProcessing}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirmAction}
        message={
          modalConfig.type === "delete"
            ? `Bạn có chắc muốn xóa "${modalConfig.customer?.name}"?`
            : `Khôi phục tài khoản cho "${modalConfig.customer?.name}"?`
        }
      />
    </>
  );
};

export default CustomerPage;