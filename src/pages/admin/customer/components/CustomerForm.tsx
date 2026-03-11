import { FormInput } from "@/components/Admin/Form/FormInput";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema } from "@/pages/admin/customer/schema/customer.schema";

export type CustomerFormValues = { email: string; password: string; name?: string; phone: string; address?: string; avatar_url?: string; full_name?: string };

export const CustomerForm = ({
    mode,
    initialData,
    onSubmit,
    isOpen,
    isLoading,
    onClose,
    setIsLoadingGlobal,
    isDisabled
}: {
    mode: "view" | "create" | "edit";
    initialData?: any;
    onSubmit: (data: any, setError: any) => void;
    isOpen: boolean;
    isLoading?: boolean;
    onClose: () => void;
    setIsLoadingGlobal?: (val: boolean) => void;
    isDisabled?: boolean;
}) => {
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        setError,
        formState: { errors }
    } = useForm<CustomerFormValues>({
        defaultValues: initialData || {},
        resolver: zodResolver(customerSchema),
        values: initialData,
    })

    useEffect(() => {
        if (!isOpen) return;

        if (mode === "create") {
            reset({
                email: "",
                password: "",
                name: "",
                phone: "",
                address: "",
                avatar_url: ""
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
                <FormInput
                    label=""
                    type="file"
                    isView={isView}
                    defaultValue={initialData?.avatar_url}
                    register={register("avatar_url")}
                    onUploadSuccess={(url) => setValue("avatar_url", url)}
                    setIsExternalLoading={setIsLoadingGlobal}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormInput
                        label="Họ và tên"
                        placeholder="Nguyen Van A"
                        register={register("name", { required: "Không được để trống" })}
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
                    {!isView && (
                        <FormInput
                            label="Mật khẩu"
                            type="password"
                            placeholder="*********"
                            register={register("password", { required: mode === "create" ? "Bắt buộc khi tạo mới" : false })}
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

                </div>

                <button id="customer-form-submit" type="submit" className="hidden" />
            </form>
        </CRUDModalTemplate>
    );
};