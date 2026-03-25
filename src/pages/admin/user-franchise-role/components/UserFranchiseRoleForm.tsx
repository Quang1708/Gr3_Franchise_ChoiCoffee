import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { FormInput } from "@/components/Admin/form/FormInput";
import FormSelect from "@/components/Admin/form/FormSelect";
import { getUserFranchiseRoleFormSchema } from "../schema/userFranchiseRole.schema";

export type UserFranchiseRoleFormValues = {
  user_id: string | undefined;
  role_id: string | undefined;
  franchise_id?: string | null;
  note?: string;
};

export type UserFranchiseRoleInitialData = {
  id?: string;
  user_id: string;
  role_id: string;
  franchise_id: string | null;
  user_display_name?: string;
  role_display_name?: string;
  franchise_display_name?: string;
  note: string;
  user_email?: string;
  role_code?: string;
  is_active?: string;
  is_deleted?: string;
  created_at?: string;
  updated_at?: string;
};

export type SimpleOption = {
  value: string;
  label: string;
};

const ViewDetailField = ({
  label,
  value,
}: {
  label: string;
  value?: string;
}) => (
  <div className="rounded-lg border border-gray-100 bg-white px-3 py-2">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-gray-700">
      {value || "(Không có)"}
    </p>
  </div>
);

export const UserFranchiseRoleForm = ({
  mode,
  initialData,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
  userOptions = [],
  roleOptions = [],
  franchiseOptions = [],
}: {
  mode: "view" | "create" | "edit";
  initialData?: UserFranchiseRoleInitialData;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (
    data: UserFranchiseRoleFormValues,
    setError: (
      field: keyof UserFranchiseRoleFormValues,
      error: { message: string },
    ) => void,
  ) => void;
  userOptions?: SimpleOption[];
  roleOptions?: SimpleOption[];
  franchiseOptions?: SimpleOption[];
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<UserFranchiseRoleFormValues>({
    resolver: zodResolver(getUserFranchiseRoleFormSchema(mode)),
    defaultValues: initialData
      ? {
          user_id: initialData.user_id,
          role_id: initialData.role_id,
          franchise_id: initialData.franchise_id ?? null,
          note: initialData.note,
        }
      : {
          user_id: "",
          role_id: "",
          franchise_id: null,
          note: "",
        },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (!initialData || mode === "create") {
      reset({
        user_id: "",
        role_id: "",
        franchise_id: null,
        note: "",
      });
    } else {
      reset({
        user_id: initialData.user_id,
        role_id: initialData.role_id,
        franchise_id: initialData.franchise_id ?? null,
        note: initialData.note,
      });
    }
  }, [isOpen, initialData, mode, reset]);

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const selectedUserId = useWatch({ control, name: "user_id" }) ?? "";
  const selectedRoleId = useWatch({ control, name: "role_id" }) ?? "";
  const selectedFranchiseId = useWatch({ control, name: "franchise_id" }) ?? "";

  const selectedUserLabel =
    userOptions.find((option) => option.value === selectedUserId)?.label ??
    initialData?.user_display_name ??
    initialData?.user_id ??
    "Không có";

  const selectedRoleLabel =
    roleOptions.find((option) => option.value === selectedRoleId)?.label ??
    initialData?.role_display_name ??
    initialData?.role_id ??
    "Không có";

  const selectedFranchiseLabel =
    franchiseOptions.find((option) => option.value === selectedFranchiseId)
      ?.label ??
    initialData?.franchise_display_name ??
    "Hệ thống (GLOBAL)";

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Phân quyền người dùng"
      mode={mode}
      isLoading={isLoading}
      maxWidth="max-w-2xl"
      onSave={() =>
        document.getElementById("user-franchise-role-form-submit")?.click()
      }
    >
      <form
        id="user-franchise-role-form"
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
        className="w-full space-y-5"
      >
        {!isView && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-900">
              {isCreate
                ? "Chọn người dùng, vai trò và chi nhánh để tạo quyền mới."
                : "Bạn chỉ có thể thay đổi vai trò cho phân quyền hiện tại."}
            </p>
          </div>
        )}

        <div className="rounded-xl border border-gray-100 bg-white p-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-800">
            Thông tin phân quyền
          </h4>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {isView || isEdit ? (
              <FormInput
                label="Người dùng"
                register={register("user_id")}
                isView
                defaultValue={selectedUserLabel}
              />
            ) : (
              <FormSelect
                label="Người dùng"
                options={userOptions}
                error={errors.user_id}
                register={register("user_id")}
                value={selectedUserId}
                placeholder="Chọn người dùng"
              />
            )}

            {isView ? (
              <FormInput
                label="Vai trò"
                register={register("role_id")}
                isView
                defaultValue={selectedRoleLabel}
              />
            ) : (
              <FormSelect
                label="Vai trò"
                options={roleOptions}
                error={errors.role_id}
                register={register("role_id")}
                value={selectedRoleId}
                placeholder="Chọn vai trò"
              />
            )}

            {isView || isEdit ? (
              <FormInput
                label="Chi nhánh"
                register={register("franchise_id")}
                isView
                defaultValue={selectedFranchiseLabel}
              />
            ) : (
              <FormSelect
                label="Chi nhánh"
                options={[
                  { value: "", label: "Hệ thống (GLOBAL)" },
                  ...franchiseOptions,
                ]}
                error={errors.franchise_id as never}
                register={register("franchise_id", {
                  setValueAs: (v) => (v === "" ? null : v),
                })}
                value={selectedFranchiseId}
                placeholder="Chọn chi nhánh"
              />
            )}

            <FormInput
              label="Ghi chú"
              placeholder="Ví dụ: Gán quyền ADMIN cho chi nhánh A"
              register={register("note")}
              error={errors.note}
              isView={isView}
              defaultValue={initialData?.note || "(Không có)"}
              className="md:col-span-2"
            />
          </div>
        </div>

        {isView && (
          <div className="rounded-xl border border-gray-100 bg-white p-4">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">
              Thông tin bổ sung
            </h4>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <ViewDetailField
                label="Email người dùng"
                value={initialData?.user_email}
              />
              <ViewDetailField
                label="Mã vai trò"
                value={initialData?.role_code}
              />
              <ViewDetailField
                label="Trạng thái hoạt động"
                value={initialData?.is_active}
              />
              <ViewDetailField
                label="Trạng thái xóa"
                value={initialData?.is_deleted}
              />
              <ViewDetailField
                label="Ngày tạo"
                value={initialData?.created_at}
              />
              <ViewDetailField
                label="Ngày cập nhật"
                value={initialData?.updated_at}
              />
            </div>
          </div>
        )}

        <button
          id="user-franchise-role-form-submit"
          type="submit"
          className="hidden"
        />
      </form>
    </CRUDModalTemplate>
  );
};
