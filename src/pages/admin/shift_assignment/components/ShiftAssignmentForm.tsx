import { FormInput } from "@/components/Admin/form/FormInput";
import FormSelect from "@/components/Admin/form/FormSelect";
import { TextEditor } from "@/components/UI/TextEditor";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { ShiftAssignmentItem } from "../models/shiftAssignment.model";

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

const STATUS_LABEL_MAP: Record<string, string> = {
  ASSIGNED: "Đã phân công",
  COMPLETED: "Hoàn thành",
  ABSENT: "Vắng mặt",
  CANCELED: "Đã hủy",
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
    control,
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
    resolver:
      mode === "view" ? undefined : zodResolver(shiftAssignmentFormSchema),
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
  const selectedUserId = useWatch({ control, name: "user_id" });
  const selectedShiftId = useWatch({ control, name: "shift_id" });

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

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="phân ca"
      mode={mode}
      maxWidth={isView ? "max-w-5xl" : "max-w-3xl"}
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
        className="w-full space-y-4"
      >
        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            isView ? "gap-x-5 gap-y-4" : "gap-x-6 gap-y-7"
          }`}
        >
          {isView ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Nhân viên
              </label>
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">{getUserLabel()}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 md:col-span-2">
              <FormSelect
                label="Nhân viên"
                name="nhân viên"
                options={
                  lookupLoading
                    ? [{ value: "", label: "Đang tải nhân viên..." }]
                    : staffOptions
                }
                value={selectedUserId}
                register={register("user_id", {
                  required: "Vui lòng chọn nhân viên",
                })}
                error={errors.user_id}
                placeholder={
                  lookupLoading
                    ? "Đang tải nhân viên..."
                    : staffOptions.length === 0
                      ? "Không có nhân viên"
                      : `Chọn nhân viên (${staffOptions.length})`
                }
                className="w-full"
              />
            </div>
          )}

          {isView ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Ca làm
              </label>
              <div className="py-2 border-b border-gray-100">
                <span className="text-sm text-gray-700">{getShiftLabel()}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 md:col-span-2">
              <FormSelect
                label="Ca làm"
                name="ca làm"
                options={
                  lookupLoading
                    ? [{ value: "", label: "Đang tải ca làm..." }]
                    : shiftOptions
                }
                value={selectedShiftId}
                register={register("shift_id", {
                  required: "Vui lòng chọn ca làm",
                })}
                error={errors.shift_id}
                placeholder={
                  lookupLoading
                    ? "Đang tải ca làm..."
                    : shiftOptions.length === 0
                      ? "Không có ca làm"
                      : `Chọn ca làm (${shiftOptions.length})`
                }
                className="w-full"
              />
            </div>
          )}

          <FormInput
            label="Ngày làm"
            type={isView ? "text" : "date"}
            register={register("work_date")}
            error={errors.work_date}
            isView={isView}
            defaultValue={initialData?.work_date}
            className={isView ? "md:col-span-1" : "md:col-span-2"}
            isDisabled={mode === "edit"}
          />

          {isView ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-500 uppercase">
                Ghi chú
              </label>
              <div className="py-2 border-b border-gray-100">
                {initialData?.note ? (
                  <div
                    className="prose prose-sm max-w-none text-sm text-gray-700"
                    dangerouslySetInnerHTML={{ __html: initialData.note }}
                  />
                ) : (
                  <span className="text-sm text-gray-700">
                    Không có ghi chú
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 md:col-span-2">
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <TextEditor
                    label="Ghi chú"
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Nhập ghi chú (không bắt buộc)"
                    minHeight={180}
                  />
                )}
              />
            </div>
          )}

          {isView && (
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Trạng thái
                </label>
                <div className="py-2 border-b border-gray-100">
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
                    {STATUS_LABEL_MAP[initialData?.status || "ASSIGNED"] ||
                      "Đã phân công"}
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

              <div className="grid grid-cols-1 gap-2">
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
