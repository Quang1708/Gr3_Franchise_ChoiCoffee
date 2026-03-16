import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAdminContextStore } from "@/stores";

import { CRUDPageTemplate, type Column } from "@/components/Admin/template/CRUDPage.template";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import ClientLoading from "@/components/Client/Client.Loading";

import type { Customer } from "@/models/customer.model";
import type { RequestCustomer } from "./models/requestCustomer.model";
import { CustomerForm, type CustomerFormValues } from "./components/CustomerForm";

import { searchCustomersUsecase } from "./usecases/searchCustomers.usecase";
import { updateCustomerStatusUsecase } from "./usecases/updateCustomerStatus.usecase";
import { deleteCustomerUsecase } from "./usecases/deleteCustomer.usecase";
import { restoreCustomerUsecase } from "./usecases/restoreCustomerUsecase";
import { createCustomerUsecase } from "./usecases/createCustomer.usecase";
import { updateCustomerUsecase } from "@/pages/admin/customer/usecases/updateCustomer05.usecase";
import type { UpdateCustomerProfileRequest } from "@/models";

const DEFAULT_AVATAR = "https://i.pinimg.com/736x/af/80/37/af80374611f4673d1928a881727e13b0.jpg";

const CustomerPage = () => {
  const selectedFranchiseId = useAdminContextStore((state) => state.selectedFranchiseId);
  const isAdmin = selectedFranchiseId === null;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal xác nhận (Xóa/Khôi phục)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "delete" | "restore";
    customer: Customer | null;
  }>({ isOpen: false, type: "delete", customer: null });

  // Modal Form (Thêm/Sửa/Xem)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Hàm Fetch ban đầu
  const fetchCustomers = async (
    pageNum = 1,
    type: "full" | "table" = "full",
    size = pageSize
  ) => {
    try {
      if (type === "full") setIsLoading(true);
      if (type === "table") setIsTableLoading(true);

      const res = await searchCustomersUsecase({
        searchCondition: {
          keyword: "",
          is_active: "",
          is_deleted: false
        },
        pageInfo: {
          pageNum,
          pageSize: size
        }
      });

      if (res.success) {
        setCustomers(res.data);
        setTotalItems(res.pageInfo.totalItems);
        setPage(res.pageInfo.pageNum);
        setPageSize(res.pageInfo.pageSize);
      }

    } catch {
      toast.error("Lỗi khi tải customer");
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1, "full");
  }, []);

  const handleSearchCustomers = async (keyword: string, filters: any) => {
    try {
      setIsLoading(true);

      const res = await searchCustomersUsecase({
        searchCondition: {
          keyword,
          is_active:
            filters?.is_active === "true"
              ? true
              : filters?.is_active === "false"
                ? false
                : "",
          is_deleted:
            filters?.is_deleted === "true"
              ? true
              : filters?.is_deleted === "false"
                ? false
                : "",
        },
        pageInfo: {
          pageNum: 1,
          pageSize: pageSize
        }
      });

      if (res.success) {
        setCustomers(res.data);
        setTotalItems(res.pageInfo.totalItems);
        setPage(1);
      }

    } catch {
      toast.error("Lỗi khi tìm kiếm");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý mở Modal Form
  const handleOpenForm = (
    mode: "create" | "edit" | "view",
    customer: Customer | null = null
  ) => {
    setFormMode(mode);
    setSelectedCustomer(customer);
    setIsFormOpen(true);
  };

  // // Xử lý Submit Form (Create)
  const handleSubmitCustomer = async (data: CustomerFormValues, setError: any) => {
    setIsProcessing(true);
    try {
      if (formMode === "create") {
        const createPayload: RequestCustomer = {
          email: data.email,
          password: data.password || "",
          phone: data.phone,
          name: data.name,
          address: data.address,
          avatar_url: data.avatar_url?.trim() ? data.avatar_url : DEFAULT_AVATAR,
        };

        await createCustomerUsecase(createPayload);
        toast.success("Thêm khách hàng thành công!");

      } else if (formMode === "edit" && selectedCustomer) {
        const updatePayload: UpdateCustomerProfileRequest = {
          email: data.email,
          phone: data.phone,
          name: data.name,
          address: data.address,
          avatar_url: data.avatar_url?.trim() ? data.avatar_url : DEFAULT_AVATAR,
        };
        await updateCustomerUsecase(selectedCustomer.id, updatePayload);
        toast.success("Cập nhật khách hàng thành công!");
      }

      await fetchCustomers(page, 'table');
      setIsFormOpen(false);
    } catch (error: any) {
      const errData = error.response?.data || error;
      const serverErrors = errData?.errors;

      if (Array.isArray(serverErrors)) {
        serverErrors.forEach((e) => {
          setError(e.field as keyof CustomerFormValues, { message: e.message });
          toast.error(e.message);
        });
      } else {
        toast.error(errData?.message || "Thao tác thất bại!");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý đổi trạng thái nhanh (Active/Inactive)
  const handleStatusChange = async (customer: Customer, newStatus: boolean) => {
    try {
      const res = await updateCustomerStatusUsecase(customer.id, newStatus);
      if (res?.success || res?.status === 200) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === customer.id ? { ...c, is_active: newStatus } : c))
        );
        toast.success("Cập nhật trạng thái thành công");
      }
    } catch {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  // Xử lý Xóa/Khôi phục qua Modal xác nhận
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
          prev.map((c) => (c.id === customer.id ? { ...c, is_deleted: type === "delete" } : c))
        );
        toast.success(type === "delete" ? "Đã xóa khách hàng" : "Đã khôi phục khách hàng");
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
      }
    } catch {
      toast.error("Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete
  const handleDeleteClick = (customer: Customer) => {
    setModalConfig({ isOpen: true, type: "delete", customer });
  };

  // Restore
  const handleRestoreClick = (customer: Customer) => {
    setModalConfig({ isOpen: true, type: "restore", customer });
  };

  // TABLE COLUMNS
  const columns: Column<Customer>[] = [
    {
      header: "Khách hàng",
      accessor: "name",
      className: "min-w-[250px] md:min-w-[350px]",
      render: (item) => (
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={item.avatar_url || DEFAULT_AVATAR}
            alt={item.name}
            className="w-10 h-10 rounded-full object-cover border border-black/10 flex-shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-gray-800 truncate">{item.name}</span>
            <span className="text-sm text-gray-500 truncate">{item.email}</span>
          </div>
        </div>
      ),
      sortable: true,
    },
    { header: "Số điện thoại", accessor: "phone", },
    {
      header: "Verified",
      accessor: "is_verified",
      render: (item) => (
        <span className={`px-2 py-1 text-[10px] rounded-xl ${item.is_verified ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
          {item.is_verified ? "Đã xác thực" : "Chưa xác thực"}
        </span>
      ),
    },
  ];

  return (
    <>
      {isLoading && <ClientLoading />}
      {isProcessing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20">
          <ClientLoading />
        </div>
      )}

      <CRUDPageTemplate<Customer>
        title="Quản lý khách hàng"
        data={customers}
        columns={columns}

        pageSize={pageSize}

        totalItems={totalItems}
        currentPage={page}
        onPageChange={(page) => fetchCustomers(page, "table")}
        onPageSizeChange={(size) => {
          setPageSize(size);
          fetchCustomers(1, "full", size);
        }}

        statusField="is_active"
        onStatusChange={isAdmin ? handleStatusChange : undefined}

        filters={[
          {
            key: "is_active",
            label: "trạng thái",
            options: [
              { value: "true", label: "Hoạt động" },
              { value: "false", label: "Ngưng hoạt động" }
            ]
          },
          {
            key: "is_deleted",
            label: "trạng thái xóa",
            options: [
              { value: "false", label: "Còn tồn tại" },
              { value: "true", label: "Đã xóa" },
            ]
          }
        ]}

        onAdd={() => handleOpenForm("create")}
        onView={(item) => handleOpenForm("view", item)}
        onEdit={(item) => handleOpenForm("edit", item)}
        onDelete={isAdmin ? handleDeleteClick : undefined}
        onRestore={isAdmin ? handleRestoreClick : undefined}
        onRefresh={() => fetchCustomers(1, "full")}
        onSearch={handleSearchCustomers}

        isTableLoading={isTableLoading}
      />
      <CustomerForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={selectedCustomer || undefined}
        isLoading={isProcessing}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitCustomer}
        setIsLoadingGlobal={setIsProcessing}
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