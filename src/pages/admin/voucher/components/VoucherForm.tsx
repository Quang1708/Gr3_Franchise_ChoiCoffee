import { useEffect, useMemo, useState } from "react";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import type { Voucher } from "../model/voucher.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { voucherSchema } from "../schemas/voucher.schema";
import type { VoucherFormData } from "../model/voucherPayload.model";
import { useForm, type Resolver } from "react-hook-form";
import { FormInput } from "@/components/Admin/form/FormInput";
import FormSelect from "@/components/Admin/form/FormSelect";
import { getProductFranchiseByFranchiseId } from "../../product/services/productFranchise/productFranchise08.service";
import { Loader2 } from "lucide-react";


export type VoucherFormProps = {
  isOpen: boolean;
  franchise?: { id: string; name: string } | null;
  franchiseId?: string;
  mode: "create" | "edit" | "view";
  initialData?:  Voucher | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: VoucherFormData) => void | Promise<void>;
};

const EMPTY_FORM: VoucherFormData = {
  franchise_id: "",
  name: "",
  type: "FIXED",
  value: 0,
  product_franchise_id: "",
  quota_total: 0,
  start_date: "",
  end_date: "",
};

const isVoucher = (data?: VoucherFormData | Voucher | null): data is Voucher => {
  return Boolean(data && "_id" in data);
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 10);
};


const formatDate = (value?: string) => {
  if (!value) return "--";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("vi-VN");
};

const VoucherForm = ({
  isOpen,
  franchise,
  mode,
  initialData,
  isLoading = false,
  onClose,
  onSubmit,
  franchiseId,
}: VoucherFormProps) => {
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema(mode=== "view" ? "edit" : mode)) as Resolver<VoucherFormData>,
    defaultValues: EMPTY_FORM,
    mode: "onChange",
  });

  const [productFranchises, setProductFranchises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (mode === "view") return `Voucher ${initialData?.code || ""}`;
    if (mode === "edit") return "Chỉnh sửa voucher";
    return `voucher - ${franchise?.name || ""}`;
  }, [mode, initialData?.code, franchise?.name]);

  const isViewMode = mode === "view";
  const voucherData = isVoucher(initialData) ? initialData : null;

  const handleSave = handleSubmit((data) => {
    onSubmit({
      ...data,
      franchise_id: data.franchise_id || franchise?.id || franchiseId || "",
    });
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchProductFranchise = async () => {
      try{
        setLoading(true);
        const response = await getProductFranchiseByFranchiseId(voucherData?.franchise_id || franchise?.id || franchiseId || "");
        if(response.success) {
          setProductFranchises(response.data);
        }
      }catch(error) {
        console.error("Failed to fetch product franchises", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductFranchise();
  }, [voucherData?.franchise_id, franchise?.id, isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "create") {
      reset({
        ...EMPTY_FORM,
        franchise_id: franchise?.id || franchiseId || "",
      });
      return;
    }

    if (initialData) {
      reset({
        franchise_id: initialData.franchise_id || franchise?.id || franchiseId || "",
        name: initialData.name || "",
        type: initialData.type || "FIXED",
        value: Number(initialData.value || 0),
        product_franchise_id: initialData.product_franchise_id || "",
        quota_total: Number(initialData.quota_total || 0),
        start_date: toDateTimeLocal(initialData.start_date),
        end_date: toDateTimeLocal(initialData.end_date),
      });
    }
  }, [franchise?.id, franchiseId, initialData, isOpen, mode, reset]);

  console.log(productFranchises);  

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      onSave={isViewMode ? undefined : () => void handleSave()}
      title={title}
      mode={isViewMode ? "view" : mode}
      isLoading={isLoading}
      maxWidth="max-w-5xl custom-scroll h-[75vh]"
    >
      {isLoading || loading ? (
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 ">
          <input type="hidden" {...register("franchise_id")} />

          <div className="md:col-span-2">
            <FormInput
              label="Chi nhánh"
              type="text"
              placeholder="Chưa chọn chi nhánh"
              defaultValue={franchise?.name || ""}
              isView={isViewMode}
              register={{}}
            />
          </div>

          <div>
            <FormInput
              label="Tên voucher"
              isDisabled={isViewMode}
              type="text"
              placeholder="VD: Voucher khuyến mãi tháng 4"
              register={register("name")}
              defaultValue={initialData?.name}
              error={errors.name}
              className="flex gap-2"
            />
          </div>

          <div>
          {isViewMode ? (
              <FormInput
                label="Loại voucher"
                type="text"
                placeholder="Chưa chọn loại voucher"
                defaultValue={initialData?.type === "FIXED" ? "Giảm tiền" : initialData?.type === "PERCENT" ? "Giảm %" : ""}
                isDisabled={true}
                register={{}}
              />
            ) : (
              <FormSelect
                label="Loại voucher"
                options={[
                  { label: "Giảm tiền", value: "FIXED" },
                  { label: "Giảm %", value: "PERCENT" },
              ]}
              placeholder="Chọn loại voucher"
              register={register("type")}
              error={errors.type}
              className="w-full"
              value={initialData?.type || "FIXED"}
            />
            )}
          </div>

          <div>
            <FormInput
              label="Giá trị"
              isDisabled={isViewMode}
              type="number"
              placeholder="VD: Voucher khuyến mãi tháng 4"
              register={register("value", { valueAsNumber: true })}
              defaultValue={initialData?.value}
              error={errors.value}
              className="flex gap-2"
            />
          </div>

          <div>
            {isViewMode || mode=== "edit" ? (
              <FormInput
                label="Áp dụng cho sản phẩm"
                type="text"
                placeholder="Chưa chọn sản phẩm"
                defaultValue={initialData?.product_franchise_id ? productFranchises.find(pf => pf.product_franchise_id === initialData.product_franchise_id)?.product_name + " - " + productFranchises.find(pf => pf.product_franchise_id === initialData.product_franchise_id)?.size : "Áp dụng cho tất cả sản phẩm"
                }

                isDisabled={true}
                register={{}}
                className="flex gap-2"
              />
            ) : (
              <FormSelect
                label="Áp dụng cho sản phẩm"
                options={productFranchises.map((pf) => ({
                  label: `${pf.product_name} - ${pf.size}`,
                  value: pf.id,
              }))}
              placeholder="Chọn product franchise"
              register={register("product_franchise_id")}
              error={errors.product_franchise_id}
              className="gap-2"
            />
            )}
          </div>

          <div>
            <FormInput
              label="Số lượng voucher"
              isDisabled={isViewMode}
              type="number"
              placeholder="VD: Voucher khuyến mãi tháng 4"
              register={register("quota_total", { valueAsNumber: true })}
              defaultValue={initialData?.quota_total}
              error={errors.quota_total}
              className="flex gap-2"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Ngày bắt đầu"
                isDisabled={isViewMode}
                type="date"
                placeholder="VD: Voucher khuyến mãi tháng 4"
                register={register("start_date")}
                // defaultValue={formatDate(initialData?.start_date)}
                error={errors.start_date}
                className="flex gap-2"
              />
            </div>

            <div>
              <FormInput
                label="Ngày kết thúc"
                isDisabled={isViewMode}
                type="date"
                placeholder="VD: Voucher khuyến mãi tháng 4"
                register={register("end_date")}
                defaultValue={formatDate(initialData?.end_date)}
                error={errors.end_date}
                className="flex gap-2"
              />
            </div>
          </div>
        </div>
      )}
    </CRUDModalTemplate>
  );
};

export default VoucherForm;