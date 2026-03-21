import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { CRUDModalTemplate } from "@/components/Admin/template/CRUDModal.template";
import { FormInput } from "@/components/Admin/form/FormInput";
import type { ProductFranchise } from "@/models/product_franchise.model";

export type PromotionFormValues = {
  name: string;
  product_franchise_id: string; // "" | "ALL" | productFranchiseId
  type: "PERCENT" | "FIXED";
  value: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
};

export type PromotionFormInitialData = {
  name: string;
  product_franchise_id: string | null;
  type: "PERCENT" | "FIXED";
  value: number;
  start_date: string | null;
  end_date: string | null;
};

export const PromotionForm = ({
  mode,
  isOpen,
  isLoading,
  onClose,
  onSubmit,
  productOptions,
  initialData,
}: {
  mode: "create" | "edit" | "view";
  isOpen: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (data: PromotionFormValues) => void;
  productOptions: ProductFranchise[];
  initialData?: PromotionFormInitialData;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    defaultValues: {
      name: "",
      product_franchise_id: "",
      type: "PERCENT",
      value: "",
      start_date: "",
      start_time: "00:00",
      end_date: "",
      end_time: "23:59",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!isOpen) return;
    const splitIso = (iso?: string | null) => {
      if (!iso) return { date: "", time: "" };
      const s = String(iso);
      const date = s.length >= 10 ? s.slice(0, 10) : "";
      const time = s.includes("T") ? s.slice(11, 16) : "";
      return { date, time };
    };

    if (mode === "create") {
      reset({
        name: "",
        product_franchise_id: "",
        type: "PERCENT",
        value: "",
        start_date: "",
        start_time: "00:00",
        end_date: "",
        end_time: "23:59",
      });
      return;
    }

    if (mode === "edit" && initialData) {
      const start = splitIso(initialData.start_date);
      const end = splitIso(initialData.end_date);
      reset({
        name: initialData.name ?? "",
        product_franchise_id:
          initialData.product_franchise_id == null
            ? "ALL"
            : String(initialData.product_franchise_id),
        type: initialData.type ?? "PERCENT",
        value: String(initialData.value ?? ""),
        start_date: start.date,
        start_time: start.time || "00:00",
        end_date: end.date,
        end_time: end.time || "23:59",
      });
    }
  }, [isOpen, mode, reset, initialData]);

  const sortedProducts = useMemo(() => {
    return [...productOptions].sort((a, b) =>
      String(a.product_name ?? "").localeCompare(
        String(b.product_name ?? ""),
        "vi",
      ),
    );
  }, [productOptions]);

  const isView = mode === "view";

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="promotion"
      mode={mode}
      isLoading={isLoading}
      maxWidth="max-w-2xl"
      onSave={() => document.getElementById("promotion-form-submit")?.click()}
    >
      <form
        id="promotion-form"
        onSubmit={handleSubmit(onSubmit)}
        className="w-full space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormInput
            label="Name"
            placeholder="Ví dụ: Giảm 10% tháng 3"
            register={register("name", { required: "Không được để trống" })}
            error={errors.name}
            isView={isView}
            className="md:col-span-2"
          />

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Product (optional)
            </label>
            {isView ? (
              <div className="py-2 border-b border-gray-300 min-h-[38px]">
                <span className="text-sm font-semibold text-gray-700">
                  {"—"}
                </span>
              </div>
            ) : (
              <>
                <select
                  {...register("product_franchise_id")}
                  disabled={mode === "edit"}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.product_franchise_id
                      ? "border-primary"
                      : "border-gray-200 focus:border-primary"
                  } ${mode === "edit" ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <option value="ALL">Toàn Sản Phẩm</option>
                  {sortedProducts.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.product_name} {p.size ? `- ${p.size}` : ""}
                    </option>
                  ))}
                </select>
                {errors.product_franchise_id && (
                  <p className="text-primary text-xs mt-1">
                    {errors.product_franchise_id.message}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Type
            </label>
            {isView ? (
              <div className="py-2 border-b border-gray-300 min-h-[38px]" />
            ) : (
              <>
                <select
                  {...register("type", { required: "Không được để trống" })}
                  className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.type
                      ? "border-primary"
                      : "border-gray-200 focus:border-primary"
                  }`}
                >
                  <option value="PERCENT">PERCENT</option>
                  <option value="FIXED">FIXED</option>
                </select>
                {errors.type && (
                  <p className="text-primary text-xs mt-1">
                    {errors.type.message}
                  </p>
                )}
              </>
            )}
          </div>

          <FormInput
            label="Value"
            type="number"
            placeholder={mode === "create" ? "10" : ""}
            register={register("value", {
              required: "Không được để trống",
              validate: (v, formValues) => {
                const n = Number(v);
                if (!Number.isFinite(n) || n <= 0) return "Giá trị phải > 0";
                if (formValues.type === "PERCENT" && n > 100) {
                  return "PERCENT phải <= 100";
                }
                return true;
              },
            })}
            error={errors.value}
            isView={isView}
          />

          <FormInput
            label="Start date"
            type="date"
            register={register("start_date", {
              required: "Không được để trống",
            })}
            error={errors.start_date}
            isView={isView}
          />

          <FormInput
            label="Start time"
            type="time"
            register={register("start_time", {
              required: "Không được để trống",
            })}
            error={errors.start_time}
            isView={isView}
          />

          <FormInput
            label="End date"
            type="date"
            register={register("end_date", {
              required: "Không được để trống",
              validate: (v, formValues) => {
                if (!formValues.start_date || !formValues.start_time)
                  return true;
                const s = new Date(
                  `${formValues.start_date}T${formValues.start_time}:00`,
                ).getTime();
                const e = new Date(
                  `${v}T${formValues.end_time || "23:59"}:00`,
                ).getTime();
                if (Number.isFinite(s) && Number.isFinite(e) && e < s) {
                  return "End datetime phải >= Start datetime";
                }
                return true;
              },
            })}
            error={errors.end_date}
            isView={isView}
          />

          <FormInput
            label="End time"
            type="time"
            register={register("end_time", { required: "Không được để trống" })}
            error={errors.end_time}
            isView={isView}
          />
        </div>

        <button id="promotion-form-submit" type="submit" className="hidden" />
      </form>
    </CRUDModalTemplate>
  );
};
