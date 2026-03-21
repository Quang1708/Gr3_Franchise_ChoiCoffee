import { FormInput } from "@/components/Admin/form/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCustomerSchema } from "@/pages/admin/customer/schema/customer.schema";

export type CustomerFormValues = {
  email: string;
  phone: string;
  password?: string;
  name?: string;
  address?: string;
  avatar_url?: string;
};

export const CustomerForm = ({
  mode,
  initialData,
  onSubmit,
  isOpen,
  isLoading,
  onClose,
  setIsLoadingGlobal,
}: {
  mode: "view" | "create" | "edit";
  initialData?: any;
  onSubmit: (data: any, setError: any) => void;
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  setIsLoadingGlobal?: (val: boolean) => void;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    defaultValues: initialData || {},
    resolver: zodResolver(getCustomerSchema(mode)),
    values: initialData,
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      reset({
        email: "",
        password: "",
        name: "",
        phone: "",
        address: "",
        avatar_url: "",
      });
    } else {
      reset(initialData || {});
    }
  }, [isOpen, initialData, mode, reset]);

  const isView = mode === "view";

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="khách hàng"
      mode={mode}
      isLoading={isLoading}
      maxWidth="max-w-3xl"
      onSave={() => document.getElementById("customer-form-submit")?.click()}
    >
      <form
        id="customer-form"
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
        className="w-full space-y-6"
      >
        <div className="flex items-center justify-center">
          <FormInput
            label=""
            type="file"
            isView={isView}
            defaultValue={initialData?.avatar_url}
            register={register("avatar_url")}
            onUploadSuccess={(url) => setValue("avatar_url", url)}
            setIsExternalLoading={setIsLoadingGlobal}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormInput
            label="Họ và tên"
            placeholder="Nguyen Van A"
            register={register("name")}
            error={errors.name}
            isView={isView}
            defaultValue={initialData?.name}
          />
          <FormInput
            label="Số điện thoại"
            type="tel"
            placeholder="0938XXXXXX"
            register={register("phone")}
            error={errors.phone}
            isView={isView}
            defaultValue={initialData?.phone}
          />
          <FormInput
            label="Email"
            type="email"
            placeholder="abc@gmail.com"
            register={register("email")}
            error={errors.email}
            className="md:col-span-2"
            isView={isView}
            defaultValue={initialData?.email}
          />
          {mode === "create" && (
            <FormInput
              label="Mật khẩu"
              type="password"
              placeholder="*********"
              register={register("password", {
                required:
                  mode === "create"
                    ? "Mật khẩu là bắt buộc khi tạo mới"
                    : false,
                minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
              })}
              error={errors.password}
              className="md:col-span-2"
            />
          )}
          <FormInput
            label="Địa chỉ"
            type="text"
            placeholder="Nhập địa chỉ..."
            register={register("address")}
            defaultValue={initialData?.address}
            isView={isView}
            error={errors.address}
            className="md:col-span-2"
          />
          {isView && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Trạng thái
                </span>
                <div className="py-2 min-h-9.5 border-b border-gray-100 md:border-none">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      initialData?.is_active
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {initialData?.is_active ? "Hoạt động" : "Ngưng hoạt động"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Xác thực
                </span>
                <div className="py-2 min-h-9.5 border-b border-gray-100 md:border-none">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      initialData?.is_verified
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {initialData?.is_verified ? "Đã xác thực" : "Chưa xác thực"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        <button id="customer-form-submit" type="submit" className="hidden" />
      </form>
    </CRUDModalTemplate>
  );
};
