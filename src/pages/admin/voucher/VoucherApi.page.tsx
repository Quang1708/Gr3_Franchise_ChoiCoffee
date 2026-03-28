import { useCallback, useEffect, useMemo, useState } from "react";
import { ActionConfirmModal } from "@/components/Admin/template/ActionConfirmModal";
import ClientLoading from "@/components/Client/Client.Loading";
import type { Voucher } from "./model/voucher.model";
import {
  changeVoucherStatus,
  deleteVoucher,
  restoreVoucher,
} from "@/services/voucher.service";
import { toastError, toastSuccess } from "@/utils/toast.util";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { useAuthStore } from "@/stores/auth.store";
import { CRUDPageTemplate, type Column } from "@/components/Admin/template/CRUDPage.template";
import FranchiseSelector from "../cart/components/FranchiseSelector";
import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import { toast } from "react-toastify";
import { searchVoucer } from "./service/searchVoucer.service";
import CustomSelect from "@/components/Admin/filters/CustomSelect";
import VoucherForm from "./components/VoucherForm";
import { createVoucher } from "./service/createVoucher.service";
import { updateVoucher } from "./service/updateVoucher.service";


const formatDate = (value?: string) => {
  if (!value) return "--";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("vi-VN");
};

const VoucherApiPage = () => {
  const user = useAuthStore((s) => s.user);
  const selectedFranchiseId = useAdminContextStore((s) => s.selectedFranchiseId);
  const hasGlobalAdminRole = useMemo(
    () =>
      (user?.roles ?? []).some(
        (r) => (r.role ?? r.role_code) === "ADMIN" && r.scope === "GLOBAL",
      ),
    [user],
  );
  const managerFranchiseId = useMemo(() => {
    if (selectedFranchiseId) return String(selectedFranchiseId);
    const frRole = (user?.roles ?? []).find(
      (r) => r.scope === "FRANCHISE" && (r.franchise_id ?? (r as any).franchiseId),
    );
    const roleFranchiseId = frRole?.franchise_id ?? (frRole as any)?.franchiseId;
    return roleFranchiseId ? String(roleFranchiseId) : null;
  }, [selectedFranchiseId, user]);
  const isAdminMode = hasGlobalAdminRole && selectedFranchiseId === null;
  const effectiveFranchiseId = isAdminMode ? null : managerFranchiseId;

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [posFranchise, setPosFranchise] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "restore">("delete");
  const [confirmItem, setConfirmItem] = useState<Voucher| null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const isAdmin = !selectedFranchiseId;
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [ selectedVoucherCode, setSelectedVoucherCode] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const fetchFranchises = async () => {
    try {
      setLoading(true);
      const res = await getAllFranchises();
      setFranchises(res || []);
    } catch {
      toast.error("Lỗi load chi nhánh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchFranchises();
  }, []);

  const fetchVoucherList = useCallback(async (
    pageNum = 1,
    type: "full" | "table" = "full",
    size = pageSize,
  ) => {
    try {
      if (type === "full") setLoading(true);
      if (type === "table") setIsTableLoading(true);
      const res = await searchVoucer({
        searchCondition: {
          value: "",
          franchise_id: posFranchise?.id || selectedFranchiseId,
          code: appliedFilters.code || "",
          end_date: appliedFilters.end_date || "",
          start_date: appliedFilters.start_date || "",
          type: appliedFilters.type || "",
          is_active: appliedFilters.is_active !== undefined ? appliedFilters.is_active : "",
          is_deleted: appliedFilters.is_deleted !== undefined ? appliedFilters.is_deleted : false,
          product_franchise_id: appliedFilters.product_franchise_id || "",
        },
        pageInfo: {
          pageNum: pageNum,
          pageSize: size,
        }
      });
      if(res.success){
        setVouchers(res.data);
        setTotalItems(res.pageInfo.totalItems);
        setPage(res.pageInfo.pageNum);
        setPageSize(res.pageInfo.pageSize);
      }
    } catch (e) {
      const msg =
        typeof (e as any)?.message === "string"
          ? (e as any).message
          : "Không thể tải danh sách voucher";
      setError(msg);
      toastError(msg);
    } finally {
     if (type === "full") {
        setLoading(false);
      }
      if (type === "table") {
        setIsTableLoading(false);
      }
    }
  }, [pageSize, posFranchise?.id, selectedFranchiseId , appliedFilters]);

  useEffect(() => {
    void fetchVoucherList(1, "full");
  }, [posFranchise?.id, selectedFranchiseId]);
  

  const searchVouchers = async (term?: string, filter?: any) => {
    setIsTableLoading(true);
    try {
      const newFilters = {
      code: term || selectedVoucherCode || "",
      end_date: filter?.endDate !== undefined ? filter.endDate : toDate || "",
      start_date: filter?.startDate !== undefined ? filter.startDate : fromDate || "",
      type: filter?.type || "",
      is_active: filter?.is_active === "true" ? true : filter?.is_active === "false" ? false : "",
      is_deleted: filter?.is_deleted === "true" ? true : filter?.is_deleted === "false" ? false : "",
      product_franchise_id: filter?.product_franchise_id || "",
    };

      setAppliedFilters(newFilters);
      const franchiseId = posFranchise?.id || selectedFranchiseId;
      const response = await searchVoucer({
        searchCondition: {
          value: "",
          code: term || selectedVoucherCode || "",
          franchise_id: franchiseId,
          end_date: filter?.endDate !== undefined ? filter.endDate : toDate || "",
          start_date: filter?.startDate !== undefined ? filter.startDate : fromDate || "",
          type: filter?.type || "",
          is_active: filter?.is_active === "true" ? true : filter?.is_active === "false" ? false : "",
          is_deleted: filter?.is_deleted === "true" ? true : filter?.is_deleted === "false" ? false : "",
          product_franchise_id: filter?.product_franchise_id || "",
        },
        pageInfo: {
          pageNum: 1,
          pageSize: pageSize,
        }
      });

      if(response.success){
        setVouchers(response.data);
        setTotalItems(response.pageInfo.totalItems);
        setPage(1);
      }
    }catch(error){
      console.log("error fetch voucer: ", error);
    }finally{
      setIsTableLoading(false)
    }
  };


  const fetchVoucherOptionsByValue = async ({ pageNum, pageSize, searchKey }: any) => {
    try {
      const franchiseId = posFranchise?.id || selectedFranchiseId;
      const res = await searchVoucer({
        searchCondition: {
          value:  "",
          code: searchKey || "", 
          franchise_id: franchiseId,
          end_date: "",
          start_date: "",
          type: "",
          is_active: "",
          is_deleted: false,
          product_franchise_id: "",
        },
        pageInfo: {
          pageNum,
          pageSize,
        },
      });

      if (res.success) {
        return {
          data: res.data.map((v: Voucher) => ({
            label: `${v.code}`,
            value: v.code,
          })),
          pageInfo: res.pageInfo,
        };
      }
      return {
        data: [],
        pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
      };
    } catch (error) {
      console.log("Lỗi fetch voucher options: ", error);
      return {
        data: [],
        pageInfo: { pageNum: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
      };
    }
  };


  const columns: Column<Voucher>[] = [
      {
        header: "Mã voucher",
        accessor: "code",
        className: "min-w-[140px]",
      },
      {
        header: "Tên",
        accessor: "name",
        className: "min-w-[180px]",
        sortable: true,
      },
      {
        header: "Chi nhánh",
        accessor: "franchise_id",
        className: "min-w-[200px]",
        render: () =>  (
          <span>
            {posFranchise?.name}
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
        accessor: "quota_used",
        sortable: true,
        render: (it) => `${it.quota_used} / ${it.quota_total}`,
      },
      {
        header: "Từ ngày",
        accessor: "start_date",
        sortable: true,
        render: (it) => formatDate(it.start_date),
      },
      {
        header: "Đến ngày",
        accessor: "end_date",
        sortable: true,
        render: (it) => formatDate(it.end_date),
      },
    ];

  

  const handleVoucherFormSubmit = async (data: {
    franchise_id: string;
    name: string;
    type: string;
    value: number;
    product_franchise_id?: string;
    quota_total: number;
    start_date: string;
    end_date: string;
    
  }) => {
    const targetFranchiseId =
      posFranchise?.id || selectedFranchiseId || effectiveFranchiseId;

    if (!targetFranchiseId) {
      toastError("Vui lòng chọn chi nhánh");
      return;
    }

    try {
      setIsFormLoading(true);
      const payload = {
        franchise_id: targetFranchiseId,
        name: data.name,
        type: data.type,
        value: data.value,
        product_franchise_id: data.product_franchise_id,
        quota_total: data.quota_total,
        start_date: data.start_date,
        end_date: data.end_date,
      };
      if (formMode === "edit" && selectedVoucher) {
        // Giả sử hàm của bạn nhận ID voucher và payload
        await updateVoucher(selectedVoucher.id || "", payload); 
        toastSuccess("Cập nhật voucher thành công");
      } else {
        await createVoucher(payload);
        toastSuccess("Tạo voucher thành công");
      }
      setIsModalOpen(false);
      setSelectedVoucher(null);
      setIsTableLoading(true);
      await fetchVoucherList(page, "table");
    } catch (e) {
      const msg =
        typeof (e as any)?.message === "string"
          ? (e as any).message
          : "Tạo voucher thất bại";
      toastError(msg);
    } finally {
      setIsFormLoading(false);
      setIsTableLoading(false);
    }
  };

  const openConfirm = (type: "delete" | "restore", item: Voucher) => {
    setConfirmType(type);
    setConfirmItem(item);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmItem) return;
    try {
      setConfirmLoading(true);
      console.log(confirmItem);
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
      await fetchVoucherList(page, "table");
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

  const handleChangeStatus = async (item: Voucher, newStatus: boolean) => {
    
    try {
      await changeVoucherStatus(String(item.id), newStatus);
      toastSuccess("Cập nhật trạng thái thành công");
      await fetchVoucherList(page, "table");
    } catch (e) {
      const msg =
        typeof (e as any)?.message === "string"
          ? (e as any).message
          : "Cập nhật trạng thái thất bại";
      toastError(msg);
    }
  };

  

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

  const handleOpenForm = (mode: "create" | "edit" | "view", data?: Voucher) => {
    setFormMode(mode);
    setSelectedVoucher(data || null);
    setIsModalOpen(true);
  };

  if(isAdmin && !posFranchise){
     return (
      <FranchiseSelector
        data={franchises}
        loading={loading}
        onSelect={(id) => {
          const f = franchises.find((x) => x.value === id);
          setPosFranchise({ id, name: f?.name });
        }}
      />
    );
  }

  if (loading) {
    return <ClientLoading />;
  }

  return (
    <>  
   
        <CRUDPageTemplate<Voucher>
        title="Danh sách voucher"
        data={vouchers}
        columns={columns}
        isTableLoading={isTableLoading}
        pageSize={5}
        totalItems={totalItems}
        currentPage={page}
        onSearch={searchVouchers}
        onRefresh={fetchVoucherList}
        onAdd={() => handleOpenForm("create")}
        onView={(item) => handleOpenForm("view", item)}
        onDelete={(item) => openConfirm("delete", item)}
        onEdit={(item) => handleOpenForm("edit", item)}
        onRestore={(item) => openConfirm("restore", item)}
        statusField="is_active"
        onStatusChange={handleChangeStatus}  
        // searchKeys={["code", "type", "is_active", "is_deleted"]}
        searchContent={
          <div className="flex items-center gap-2">
            <CustomSelect
              fetchOnSearchOnly={true}
              placeholder="Nhập mã voucher"
              value={selectedVoucherCode || ""}
              fetchOptions={fetchVoucherOptionsByValue}
              onChange={(value) => {
                setSelectedVoucherCode(value);
              }}
            />
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
            key: "is_active",
            label: "Trạng thái",
            options: [
              { label: "Đang hoạt động", value: "true" },
              { label: "Ngừng hoạt động", value: "false" },
            ],
          },
        ]}
      />

      

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
      <VoucherForm
        key={`${formMode}-${selectedVoucher?._id || "new"}-${isModalOpen ? "open" : "closed"}`}
        isOpen={isModalOpen}
        franchise={posFranchise || selectedFranchiseId || undefined}
        mode={formMode}
        initialData={selectedVoucher}
        isLoading={isFormLoading}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleVoucherFormSubmit}
      />
    </>
  );
};

export default VoucherApiPage;

