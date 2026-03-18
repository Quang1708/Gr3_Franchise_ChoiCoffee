import { FormInput } from "@/components/Admin/form/FormInput";
import { useForm } from "react-hook-form";
import { useEffect, useState, useMemo, useCallback } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { zodResolver } from "@hookform/resolvers/zod";
import { getShiftSchema } from "@/pages/admin/shift/schema/shift.schema";
import type { Shift } from "@/pages/admin/shift/models/ShiftReponse.model";
import { getAllFranchises } from "@/components/categoryFranchise/services/franchise08.service";
import type { Franchise } from "@/components/categoryFranchise/models/franchise08.model";

import { useAdminContextStore } from "@/stores/adminContext.store";
import { Loader2 } from "lucide-react";

export type ShiftFormValues = {
  name: string;
  start_time: string;
  end_time: string;
  franchise_id: string;
};

type ShiftFormProps = {
  mode: "view" | "create" | "edit";
  initialData?: Partial<Shift>;
  onSubmit: (
    data: ShiftFormValues,
    setError: ReturnType<typeof useForm<ShiftFormValues>>["setError"],
  ) => void;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
};

const toHHMM = (timeValue?: string) => {
  if (!timeValue) return "";
  return timeValue.slice(0, 5);
};

// Ensure time format is HH:mm
const formatTimeToHHMM = (time: string): string => {
  if (!time) return "";

  // If already in HH:mm format, return as-is
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  // If has seconds (HH:mm:ss), remove them
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time.slice(0, 5);
  }

  // If single digit hour or minute, pad with zeros
  const parts = time.split(":");
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, "0");
    const minutes = parts[1].padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return time;
};

const ShiftForm = ({
  mode,
  initialData,
  onSubmit,
  isOpen,
  isLoading,
  onClose,
}: ShiftFormProps) => {
  const [franchiseDisplay, setFranchiseDisplay] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [loadingFranchiseName, setLoadingFranchiseName] = useState(false);
  const [franchiseOptions, setFranchiseOptions] = useState<Franchise[]>([]);
  const [loadingFranchises, setLoadingFranchises] = useState(false);

  // Check if user is ADMIN (GLOBAL)

  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);
  const isAdmin = franchiseId === null;

  // Get current franchise name for non-admin users
  const currentFranchiseName = useMemo(() => {
    if (!franchiseId || franchiseId === "") return "";
    const franchise = franchiseOptions.find(
      (f) => f.value === franchiseId || f.code === franchiseId,
    );
    return franchise?.name;
  }, [franchiseId, franchiseOptions]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    defaultValues: {
      name: "",
      start_time: "",
      end_time: "",
      franchise_id: "",
    },
    resolver: zodResolver(getShiftSchema(mode)),
    mode: "onChange",
  });

  const loadFranchiseOptions = useCallback(async () => {
    try {
      setLoadingFranchises(true);
      const franchises = await getAllFranchises();
      if (franchises) {
        setFranchiseOptions(franchises);
      }
    } catch (error) {
      console.error("Error loading franchises:", error);
    } finally {
      setLoadingFranchises(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      reset({
        name: "",
        start_time: "",
        end_time: "",
        franchise_id: isAdmin ? "" : franchiseId || "",
      });
    } else {
      reset({
        name: initialData?.name || "",
        start_time: toHHMM(initialData?.start_time),
        end_time: toHHMM(initialData?.end_time),
        franchise_id: initialData?.franchise_id || "",
      });
    }

    // Load franchise options for admin in create mode only
    if (mode === "create") {
      loadFranchiseOptions();
    }
  }, [
    isOpen,
    initialData,
    mode,
    reset,
    isAdmin,
    franchiseId,
    loadFranchiseOptions,
  ]);

  useEffect(() => {
    if (!isOpen) return;
    if (mode === "create") return; // Don't fetch for create mode

    const franchiseId = initialData?.franchise_id;
    if (!franchiseId) return;

    let isMounted = true;

    const fetchFranchiseName = async () => {
      try {
        setLoadingFranchiseName(true);
        const franchises = await getAllFranchises();
        const matchedFranchise = franchises?.find(
          (item) => item.value === franchiseId || item.code === franchiseId,
        );

        if (isMounted) {
          setFranchiseDisplay({
            id: franchiseId,
            name: matchedFranchise?.name || franchiseId,
          });
          setLoadingFranchiseName(false);
        }
      } catch (error) {
        console.error("Error fetching franchises:", error);
        if (isMounted) {
          setFranchiseDisplay({
            id: franchiseId,
            name: franchiseId,
          });
        }
      } finally {
        if (isMounted) {
          setLoadingFranchiseName(false);
        }
      }
    };

    void fetchFranchiseName();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mode, initialData?.franchise_id]);

  const isView = mode === "view";
  const franchiseValueForDisplay =
    isView || mode === "edit"
      ? franchiseDisplay && franchiseDisplay.id === initialData?.franchise_id
        ? franchiseDisplay.name
        : initialData?.franchise_id || ""
      : initialData?.franchise_id;

  const DateFormat = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Show loading screen when fetching franchise name for view/edit mode
  if (loadingFranchiseName && (mode === "view" || mode === "edit")) {
    return (
      <CRUDModalTemplate
        isOpen={isOpen}
        onClose={onClose}
        title="ca làm việc"
        mode={mode}
        maxWidth="max-w-3xl"
        isLoading={true}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRUDModalTemplate>
    );
  }

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="ca làm việc"
      mode={mode}
      maxWidth="max-w-3xl"
      isLoading={isLoading}
      onSave={() => document.getElementById("shift-form-submit")?.click()}
    >
      <form
        id="shift-form"
        onSubmit={handleSubmit((data) => {
          // Format time to HH:mm before submitting
          const formattedData = {
            ...data,
            start_time: formatTimeToHHMM(data.start_time),
            end_time: formatTimeToHHMM(data.end_time),
          };
          onSubmit(formattedData, setError);
        })}
        className="w-full space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
          <FormInput
            label="Tên ca làm việc"
            type="text"
            placeholder="VD: Ca sáng"
            register={register("name")}
            error={errors.name}
            isView={isView}
            defaultValue={initialData?.name}
            className="md:col-span-2"
          />

          {/* Chi nhánh - Create: admin can select, non-admin disabled | Edit/View: always disabled */}
          {isView && (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Chi nhánh
              </label>
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">
                  {franchiseValueForDisplay || "---"}
                </span>
              </div>
            </div>
          )}

          {/* CREATE MODE */}
          {mode === "create" && (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Chi nhánh
              </label>

              {isAdmin === true ? (
                // ADMIN CREATE → CHO CHỌN
                <select
                  {...register("franchise_id", {
                    required: "Không được để trống",
                  })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                >
                  <option value="">
                    {loadingFranchises ? "Đang tải..." : "-- Chọn chi nhánh --"}
                  </option>

                  {franchiseOptions.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              ) : (
                // NON ADMIN CREATE → KHÔNG CHO CHỌN
                <input
                  type="text"
                  value={currentFranchiseName}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50"
                />
              )}

              {errors.franchise_id && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.franchise_id.message}
                </p>
              )}
            </div>
          )}

          {mode === "edit" && (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Chi nhánh
              </label>
              <input
                type="text"
                value={franchiseValueForDisplay}
                disabled
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
          )}

          <FormInput
            label="Thời gian bắt đầu"
            type={isView ? "text" : "time"}
            placeholder="VD: 08:00"
            register={register("start_time")}
            error={errors.start_time}
            isView={isView}
            defaultValue={toHHMM(initialData?.start_time)}
          />

          <FormInput
            label="Thời gian kết thúc"
            type={isView ? "text" : "time"}
            placeholder="VD: 17:00"
            register={register("end_time")}
            error={errors.end_time}
            isView={isView}
            defaultValue={toHHMM(initialData?.end_time)}
          />

          {isView && (
            <div className="flex flex-col gap-6 md:col-span-2">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Trạng thái
                </span>
                <div className="py-2 min-h-10 border-b border-gray-100 md:border-none">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${initialData?.is_active ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"}`}
                  >
                    {initialData?.is_active ? "Hoạt động" : "Ngưng hoạt động"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                <FormInput
                  label="Tạo ngày"
                  type="text"
                  defaultValue={
                    initialData?.created_at
                      ? DateFormat(initialData.created_at)
                      : ""
                  }
                  isView={isView}
                  register={{}}
                />
                <FormInput
                  label="Cập nhật ngày"
                  type="text"
                  defaultValue={
                    initialData?.updated_at
                      ? DateFormat(initialData.updated_at)
                      : ""
                  }
                  isView={isView}
                  register={{}}
                />
              </div>
            </div>
          )}
        </div>

        <button
          id="shift-form-submit"
          type="submit"
          className="hidden"
          aria-label="Lưu ca làm việc"
          title="Lưu ca làm việc"
        />
      </form>
    </CRUDModalTemplate>
  );
};

export default ShiftForm;
