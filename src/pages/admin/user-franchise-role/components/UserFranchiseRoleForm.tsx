import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { FormInput } from "@/components/Admin/form/FormInput";
import FormSelect from "@/components/Admin/Form/FormSelect";
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
    setError: (field: keyof UserFranchiseRoleFormValues, error: { message: string }) => void,
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
  const selectedUserId = useWatch({ control, name: "user_id" }) ?? "";
  const selectedRoleId = useWatch({ control, name: "role_id" }) ?? "";
  const selectedFranchiseId = useWatch({ control, name: "franchise_id" }) ?? "";

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Phân quyền người dùng"
      mode={mode}
      isLoading={isLoading}
      maxWidth="max-w-2xl"
      onSave={() => document.getElementById("user-franchise-role-form-submit")?.click()}
    >
      <form
        id="user-franchise-role-form"
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
        className="w-full space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isView || isEdit ? (
            <FormInput
              label="Người dùng"
              register={register("user_id")}
              isView
              defaultValue={initialData?.user_id}
            />
          ) : (
            <FormSelect
              label="Người dùng"
              options={userOptions}
              error={errors.user_id}
              register={register("user_id")}
              value={selectedUserId}
            />
          )}

          {isView ? (
            <FormInput
              label="Vai trò"
              register={register("role_id")}
              isView
              defaultValue={initialData?.role_id}
            />
          ) : (
            <FormSelect
              label="Vai trò"
              options={roleOptions}
              error={errors.role_id}
              register={register("role_id")}
              value={selectedRoleId}
            />
          )}

          {isView || isEdit ? (
            <FormInput
              label="Chi nhánh"
              register={register("franchise_id")}
              isView
              defaultValue={initialData?.franchise_id ?? "Hệ thống (GLOBAL)"}
            />
          ) : (
            <FormSelect
              label="Chi nhánh"
              options={[{ value: "", label: "Hệ thống (GLOBAL)" }, ...franchiseOptions]}
              error={errors.franchise_id as never}
              register={register("franchise_id", {
                setValueAs: (v) => (v === "" ? null : v),
              })}
              value={selectedFranchiseId}
            />
          )}

          <FormInput
            label="Ghi chú"
            placeholder="Ví dụ: Gán quyền ADMIN cho chi nhánh A"
            register={register("note")}
            error={errors.note}
            isView={isView}
            defaultValue={initialData?.note || "(Không có)"}
          />

          {isView && (
            <>
              <FormInput
                label="Email người dùng"
                register={register("note")}
                isView
                defaultValue={initialData?.user_email || "(Không có)"}
              />
              <FormInput
                label="Mã vai trò"
                register={register("note")}
                isView
                defaultValue={initialData?.role_code || "(Không có)"}
              />
              <FormInput
                label="Trạng thái hoạt động"
                register={register("note")}
                isView
                defaultValue={initialData?.is_active || "(Không có)"}
              />
              <FormInput
                label="Trạng thái xóa"
                register={register("note")}
                isView
                defaultValue={initialData?.is_deleted || "(Không có)"}
              />
              <FormInput
                label="Ngày tạo"
                register={register("note")}
                isView
                defaultValue={initialData?.created_at || "(Không có)"}
              />
              <FormInput
                label="Ngày cập nhật"
                register={register("note")}
                isView
                defaultValue={initialData?.updated_at || "(Không có)"}
              />
            </>
          )}
        </div>

        <button id="user-franchise-role-form-submit" type="submit" className="hidden" />
      </form>
    </CRUDModalTemplate>
  );
};
