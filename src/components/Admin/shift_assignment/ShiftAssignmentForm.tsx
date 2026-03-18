import { FormInput } from "@/components/Admin/Form/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ShiftAssignmentItem } from "@/pages/admin/shift_assignment/models/shiftAssignment.model";

// Define schema inline to avoid resolver type issues
const shiftAssignmentFormSchema = z.object({
  user_id: z.string().min(1, "Nhân viên là bắt buộc"),
  shift_id: z.string().min(1, "Ca làm là bắt buộc"),
  work_date: z.string().min(1, "Ngày làm là bắt buộc"),
  note: z.string().optional(),
});

export type ShiftAssignmentFormValues = {
  user_id: string;
  shift_id: string;
  work_date: string;
  note?: string;
};

type SelectOption = {
  value: string;
  label: string;
};

type ShiftAssignmentFormProps = {
  mode: "view" | "create" | "edit";
  initialData?: Partial<ShiftAssignmentItem>;
  onSubmit: (
    data: ShiftAssignmentFormValues,
    setError: ReturnType<typeof useForm<ShiftAssignmentFormValues>>["setError"],
  ) => void;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  staffOptions?: SelectOption[];
  shiftOptions?: SelectOption[];
  lookupLoading?: boolean;
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN");
};

const ShiftAssignmentForm = ({
  mode,
  initialData,
  onSubmit,
  isOpen,
  isLoading,
  onClose,
  staffOptions = [],
  shiftOptions = [],
  lookupLoading = false,
}: ShiftAssignmentFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ShiftAssignmentFormValues>({
    defaultValues: {
      user_id: "",
      shift_id: "",
      work_date: "",
      note: "",
    },
    resolver: mode === "view" ? undefined : zodResolver(shiftAssignmentFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      reset({
        user_id: "",
        shift_id: "",
        work_date: new Date().toISOString().split("T")[0],
        note: "",
      });
    } else {
      reset({
        user_id: initialData?.user_id || "",
        shift_id: initialData?.shift_id || "",
        work_date: initialData?.work_date || "",
        note: initialData?.note || "",
      });
    }
  }, [isOpen, initialData, mode, reset]);

  const isView = mode === "view";

  // Get display labels for view mode
  const getUserLabel = () => {
    if (!initialData?.user_id) return "---";
    return initialData.user_name || initialData.user_id;
  };

  const getShiftLabel = () => {
    if (!initialData?.shift_id) return "---";
    const shift = shiftOptions.find((s) => s.value === initialData.shift_id);
    if (shift) return shift.label;
    if (initialData.start_time && initialData.end_time) {
      return `${initialData.start_time} - ${initialData.end_time}`;
    }
    return initialData.shift_id;
  };

  // Show loading screen when fetching data - removed blocking behavior
  // Just let the select dropdowns show "Đang tải..." if loading

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="phân ca"
      mode={mode}
      maxWidth="max-w-3xl"
      isLoading={isLoading}
      onSave={() =>
        document.getElementById("shift-assignment-form-submit")?.click()
      }
    >
      <form
        id="shift-assignment-form"
        onSubmit={handleSubmit((data) => {
          onSubmit(data, setError);
        })}
        className="w-full space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
          {/* Nhân viên */}
          {isView ? (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Nhân viên
              </label>
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">{getUserLabel()}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Nhân viên <span className="text-red-500">*</span>
              </label>
              <select
                {...register("user_id", {
                  required: "Vui lòng chọn nhân viên",
                })}
                disabled={mode === "edit" || lookupLoading}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-700"
              >
                <option value="">
                  {lookupLoading
                    ? "Đang tải nhân viên..."
                    : staffOptions.length === 0
                      ? "Không có nhân viên"
                      : `-- Chọn nhân viên (${staffOptions.length}) --`}
                </option>
                {staffOptions.map((staff) => (
                  <option key={staff.value} value={staff.value}>
                    {staff.label}
                  </option>
                ))}
              </select>
              {errors.user_id && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.user_id.message}
                </p>
              )}
            </div>
          )}

          {/* Ca làm */}
          {isView ? (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Ca làm
              </label>
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">{getShiftLabel()}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Ca làm <span className="text-red-500">*</span>
              </label>
              <select
                {...register("shift_id", {
                  required: "Vui lòng chọn ca làm",
                })}
                disabled={mode === "edit" || lookupLoading}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white disabled:bg-gray-50 disabled:text-gray-700"
              >
                <option value="">
                  {lookupLoading
                    ? "Đang tải ca làm..."
                    : shiftOptions.length === 0
                      ? "Không có ca làm"
                      : `-- Chọn ca làm (${shiftOptions.length}) --`}
                </option>
                {shiftOptions.map((shift) => (
                  <option key={shift.value} value={shift.value}>
                    {shift.label}
                  </option>
                ))}
              </select>
              {errors.shift_id && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.shift_id.message}
                </p>
              )}
            </div>
          )}

          {/* Ngày làm */}
          <FormInput
            label="Ngày làm"
            type={isView ? "text" : "date"}
            register={register("work_date")}
            error={errors.work_date}
            isView={isView}
            defaultValue={initialData?.work_date}
            className="md:col-span-2"
            isDisabled={mode === "edit"}
          />

          {/* Ghi chú */}
          {isView ? (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Ghi chú
              </label>
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">
                  {initialData?.note || "Không có ghi chú"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Ghi chú
              </label>
              <textarea
                {...register("note")}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white min-h-[100px] resize-none"
                placeholder="Nhập ghi chú (không bắt buộc)"
              />
            </div>
          )}

          {/* View mode - additional info */}
          {isView && (
            <div className="flex flex-col gap-6 md:col-span-2">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Trạng thái
                </span>
                <div className="py-2 min-h-10 border-b border-gray-100 md:border-none">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      initialData?.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : initialData?.status === "CANCELED"
                          ? "bg-red-100 text-red-700"
                          : initialData?.status === "ABSENT"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {initialData?.status || "ASSIGNED"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Người phân ca
                </label>
                <div className="py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">
                    {initialData?.assigned_by_name ||
                      initialData?.assigned_by ||
                      "---"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                <FormInput
                  label="Tạo lúc"
                  type="text"
                  defaultValue={formatDateTime(initialData?.created_at)}
                  isView={isView}
                  register={{}}
                />
                <FormInput
                  label="Cập nhật lúc"
                  type="text"
                  defaultValue={formatDateTime(initialData?.updated_at)}
                  isView={isView}
                  register={{}}
                />
              </div>
            </div>
          )}
        </div>

        <button
          id="shift-assignment-form-submit"
          type="submit"
          className="hidden"
          aria-label="Lưu phân ca"
          title="Lưu phân ca"
        />
      </form>
    </CRUDModalTemplate>
  );
};

export default ShiftAssignmentForm;
