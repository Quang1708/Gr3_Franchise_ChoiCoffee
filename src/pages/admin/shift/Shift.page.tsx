import { CRUDPageTemplate, type Column } from "@/components/Admin/template/CRUDPage.template";
import ClientLoading from "@/components/Client/Client.Loading";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Shift } from "./models/ShiftReponse.model";
import { searchShift } from "./usecases/searchShift.usecase";
import { PERM } from "@/auth/rbac.permissions";
import { can } from "@/auth/rbac";
import { useAuthStore } from "@/stores/auth.store";
import { useAdminContextStore } from "@/stores/adminContext.store";
import ShiftForm, { type ShiftFormValues } from "@/components/Admin/shift/ShiftForm";
import { createShift, updateShift } from "@/components/Admin/shift/services/shift01.service";
import { toastSuccess, toastError } from "@/utils/toast.util";
import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import { restoreShiftById } from "./usecases/restoreShift.usecases";
import { changeShiftStatusById } from "./usecases/changeShiftStatus.usecase";
import { deleteShiftById } from "./usecases/deleteShift.usecase";
import { toast } from "react-toastify";


const ShiftPage = () => {
    const user = useAuthStore((s) => s.user);
      const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId) || "";
    
      const canWrite = useMemo(
        () => can(user, PERM.CATEGORY_WRITE, franchiseId || undefined),
        [user, franchiseId],
      );
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<"create" | "edit" | "view">("create");
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [franchises, setFranchises] = useState<any[]>([]);

    const fetchShifts = useCallback(async (
        pageNum = 1,
        type: "full" | "table" = "full",
        size = pageSize
    ) => {
      try {
        if (type === "full") setIsLoading(true);
        if (type === "table") setIsTableLoading(true);

        const response = await searchShift({
          searchCondition: {
            franchise_id: franchiseId || "",
          },
          pageInfo: {
            pageNum,
            pageSize: size,
          },
        });

        if (response) {
          setShifts(response.data);
          setPage(response.pageInfo.pageNum);
          setPageSize(response.pageInfo.pageSize);
          setTotalItems(response.pageInfo.totalItems);
        }
      } catch (error) {
        console.error("Error fetching shifts:", error);
      } finally {
        setIsLoading(false);
        setIsTableLoading(false);
      }
    }, [franchiseId, pageSize]);

    useEffect(() => {
      const loadFranchises = async () => {
        const data = await getAllFranchises();
        if (data) setFranchises(data);
      };

      void loadFranchises();
    }, []);

    const franchiseMap = useMemo(() => {
      const map: Record<string, string> = {};

      franchises.forEach((f) => {
        map[f.value] = f.name;
      });

      return map;
    }, [franchises]);

    useEffect(() => {
        void fetchShifts();
    }, [fetchShifts]);

    const column: Column<Shift>[] = [
        { header: "Ca làm ",
          accessor: "name",
          sortable: false,
        },

         { header: "Chi nhánh",
          accessor: (shift) => franchiseMap[shift.franchise_id] || "N/A",
          sortable: false,
        },

        { header: "Bắt đầu",
          accessor: "start_time",
          sortable: true,
        },

        { header: "Kết thúc",
          accessor: "end_time",
          sortable: true,
        }, 
        
    ];
    
    const handleOpenForm = (
        mode: "create" | "edit" | "view",
        shift: Shift | null = null
      ) => {
        setFormMode(mode);
        setSelectedShift(shift);
        setIsFormOpen(true);
      };

    const handleRestoreShift = async (id: string) => {
      try{
        setIsProcessing(true);
        await (id);
        toastSuccess("Khôi phục ca làm việc thành công!");
        await restoreShiftById(id);
      }catch(error){
        console.error("Error restoring shift:", error);
        toastError("Có lỗi xảy ra khi khôi phục ca làm việc");
      }finally{
        setIsProcessing(false);
        await fetchShifts(page, "table", pageSize);
      }
    };

    const handleSubmitShift = async (data: ShiftFormValues, setError: any) => {
      try {
        setIsProcessing(true);

        if (formMode === "create") {
          await createShift({
            franchise_id: data.franchise_id,
            name: data.name,
            start_time: data.start_time,
            end_time: data.end_time,
          });
          toastSuccess("Tạo ca làm việc thành công!");
        } else if (formMode === "edit" && selectedShift) {
          await updateShift(selectedShift.id, {
            franchise_id: data.franchise_id,
            name: data.name,
            start_time: data.start_time,
            end_time: data.end_time,
          });
          toastSuccess("Cập nhật ca làm việc thành công!");
        }

        setIsFormOpen(false);
        await fetchShifts(page, "table", pageSize);
      } catch (error: any) {
        console.error("Error submitting shift:", error);

        // Handle validation errors from backend
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;

          // Check if errors is an array (with field/message objects)
          if (Array.isArray(errors)) {
            errors.forEach((err: { field: string; message: string }) => {
              setError(err.field, {
                type: "manual",
                message: err.message,
              });
            });
          } else {
            // Handle object format: { field_name: "error message" }
            Object.keys(errors).forEach((field) => {
              setError(field, {
                type: "manual",
                message: errors[field],
              });
            });
          }
        } else {
          const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi lưu ca làm việc";
          toastError(errorMessage);
        }
      } finally {
        setIsProcessing(false);
      }
    };

    const handleChangeShiftStatus = async (item: Shift, isActive: boolean) => {
      try {
        setIsProcessing(true);
        await changeShiftStatusById(item.id, isActive);
        setShifts((prev) =>
          prev.map((shift) =>
            shift.id === item.id ? { ...shift, is_active: isActive } : shift
          )
        );
        toastSuccess("Cập nhật trạng thái ca làm việc thành công!");
        await fetchShifts(page, "table", pageSize);
      } catch (error) {
        console.error("Error changing shift status:", error);
        toastError("Có lỗi xảy ra khi cập nhật trạng thái ca làm việc");
      } finally {
        setIsProcessing(false);
      }
    };

    const handleDeleteShift = async (item: Shift) => {
      try{
        setIsProcessing(true);
        await deleteShiftById(item.id);
        toastSuccess("Xóa ca làm việc thành công!");
        await fetchShifts(page, "table", pageSize);
      } catch (error) {
        console.error("Error deleting shift:", error);
        toastError("Có lỗi xảy ra khi xóa ca làm việc");
      } finally {
        setIsProcessing(false);
        await fetchShifts(page, "table", pageSize);
      }

    }

    const handleSearchShift = async (name: string, filters: any) => {
    try {
      setIsProcessing(true);

      const res = await searchShift({
        searchCondition: {
          name,
          franchise_id: franchiseId || "",
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

      console.log(res);

      if (res.success) {
        setShifts(res.data);
        setTotalItems(res.pageInfo.totalItems);
        setPage(1);
      }

    } catch {
      toast.error("Lỗi khi tìm kiếm");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isLoading && <ClientLoading />}
      

      <CRUDPageTemplate<Shift>

        statusField="is_active"
        title="Ca làm việc"
        columns={column}
        data={shifts}
        pageSize={pageSize}
        totalItems={totalItems}
        currentPage={page}
        onView={(item) => handleOpenForm("view", item)}
        onAdd={canWrite ? () => handleOpenForm("create") : undefined}
        onEdit={canWrite ? (item) => handleOpenForm("edit", item) : undefined}
        onDelete={(item) => handleDeleteShift(item)}
        onRefresh={() => fetchShifts(1, "full")}
        onStatusChange={(item, isActive) => handleChangeShiftStatus(item, isActive)}
        onRestore={(item) => handleRestoreShift(item.id)}
        onPageChange={(newPage) => fetchShifts(newPage, "table")}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          fetchShifts(1, "table", newSize);
        }} 

        onSearch={handleSearchShift}

        filters={
          [
            { key: "is_active",
              label: "Trạng thái hoạt động",
              options: [
                { label: "Hoạt động", value: "true" },
                { label: "Không hoạt động", value: "false" },
              ],
            },

            { key: "is_deleted",
              label: "Trạng thái xóa",       
              options: [
                { label: "Đã xóa", value: "true" },
                { label: "Chưa xóa", value: "false" },
              ],

            }
          ]
        }
        isTableLoading={isProcessing || isTableLoading}
      />

      <ShiftForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={selectedShift || undefined}
        isLoading={isProcessing}
        onClose={() => setIsFormOpen(false)}
        onSubmit={(data, setError) => {
          void handleSubmitShift(data, setError);
        }}
      />
    </>
  );
}


export default ShiftPage