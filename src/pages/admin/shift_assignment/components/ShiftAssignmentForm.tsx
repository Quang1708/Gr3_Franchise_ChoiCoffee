import { FormInput } from "@/components/Admin/form/FormInput";
import FormSelect from "@/components/Admin/form/FormSelect";
import { TextEditor } from "@/components/UI/TextEditor";
import ClientLoading from "@/components/Client/Client.Loading";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  ShiftAssignmentItem,
  ShiftAssignmentStatus,
} from "../models/shiftAssignment.model";

const shiftAssignmentFormSchema = z
  .object({
    user_id: z.string().min(1, "Nhân viên là bắt buộc"),
    shift_id: z.string().optional(),
    shift_ids: z.array(z.string()).optional(),
    work_date: z.string().min(1, "Ngày làm là bắt buộc"),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasSingle = Boolean(String(data.shift_id ?? "").trim());
      const hasMulti =
        Array.isArray(data.shift_ids) && data.shift_ids.length > 0;
      return hasSingle || hasMulti;
    },
    {
      message: "Ca làm là bắt buộc",
      path: ["shift_id"],
    },
  );

export type ShiftAssignmentFormValues = {
  user_id: string;
  shift_id?: string;
  shift_ids?: string[];
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
  defaultWorkDate?: string;
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
  canUpdateStatus?: boolean;
  isUpdatingStatus?: boolean;
  onUpdateStatus?: (status: ShiftAssignmentStatus) => void;
};

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN");
};

const ShiftAssignmentForm = ({
  mode,
  initialData,
  defaultWorkDate,
  onSubmit,
  isOpen,
  isLoading,
  onClose,
  staffOptions = [],
  shiftOptions = [],
  lookupLoading = false,
  canUpdateStatus = false,
  isUpdatingStatus = false,
  onUpdateStatus,
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
      shift_ids: [],
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
        shift_ids: [],
        work_date: defaultWorkDate || new Date().toISOString().split("T")[0],
        note: "",
      });
    } else {
      reset({
        user_id: initialData?.user_id || "",
        shift_id: initialData?.shift_id || "",
        shift_ids: initialData?.shift_id ? [initialData.shift_id] : [],
        work_date: initialData?.work_date || "",
        note: initialData?.note || "",
      });
    }
  }, [defaultWorkDate, isOpen, initialData, mode, reset]);

  const isView = mode === "view";
  const selectedUserId = useWatch({ control, name: "user_id" });
  const [selectedStatusOverride, setSelectedStatusOverride] =
    useState<ShiftAssignmentStatus | null>(null);
  const selectedStatus =
    selectedStatusOverride ?? initialData?.status ?? "ASSIGNED";

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
      hideScrollbar={!isView}
      onSave={() =>
        document.getElementById("shift-assignment-form-submit")?.click()
      }
    >
      {isLoading && <ClientLoading />}

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
              <label className="text-sm font-medium text-gray-700">
                Ca làm (có thể chọn nhiều)
              </label>
              <Controller
                name="shift_ids"
                control={control}
                render={({ field }) => (
                  <div className="max-h-44 space-y-2 overflow-auto scrollbar-hide hide-scrollbar rounded-lg border border-gray-300 p-3">
                    {lookupLoading ? (
                      <p className="text-sm text-gray-500">
                        Đang tải ca làm...
                      </p>
                    ) : shiftOptions.length === 0 ? (
                      <p className="text-sm text-gray-500">Không có ca làm</p>
                    ) : (
                      shiftOptions.map((option) => {
                        const isChecked = (field.value || []).includes(
                          option.value,
                        );
                        return (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentValues = field.value || [];
                                const nextValues = e.target.checked
                                  ? [...currentValues, option.value]
                                  : currentValues.filter(
                                      (value) => value !== option.value,
                                    );

                                field.onChange(nextValues);
                              }}
                              className="size-4 rounded border-gray-300"
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                )}
              />
              {errors.shift_id?.message && (
                <p className="text-xs text-red-500">
                  {errors.shift_id.message}
                </p>
              )}
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
                  {canUpdateStatus ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatusOverride(
                            e.target.value as ShiftAssignmentStatus,
                          )
                        }
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
                        disabled={isUpdatingStatus}
                      >
                        <option value="ASSIGNED">Đã phân công</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="ABSENT">Vắng mặt</option>
                        <option value="CANCELED">Đã hủy</option>
                      </select>
                      <button
                        type="button"
                        className="cursor-pointer rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={
                          isUpdatingStatus ||
                          selectedStatus === initialData?.status
                        }
                        onClick={() => {
                          onUpdateStatus?.(selectedStatus);
                        }}
                      >
                        {isUpdatingStatus ? "Đang lưu..." : "Cập nhật"}
                      </button>
                    </div>
                  ) : (
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
                  )}
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
