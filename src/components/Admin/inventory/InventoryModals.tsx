import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../UI/Modal";
import { AlertTriangle } from "lucide-react";

export type InventoryUpdateForm = {
  quantity: number;
  alertThreshold: number;
  isActive: boolean;
};

const schema = z.object({
  quantity: z.coerce
    .number()
    .min(0, "Số lượng phải >= 0")
    .finite("Số lượng không hợp lệ"),
  alertThreshold: z.coerce
    .number()
    .min(0, "Ngưỡng cảnh báo phải >= 0")
    .finite("Ngưỡng cảnh báo không hợp lệ"),
  isActive: z.coerce.boolean(),
});

type FormData = z.infer<typeof schema>;

export const UpdateInventoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  defaultValues?: Partial<FormData>;
  onSubmit: (data: InventoryUpdateForm) => void;
}> = ({ isOpen, onClose, title, subtitle, defaultValues, onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      quantity: defaultValues?.quantity ?? 0,
      alertThreshold: defaultValues?.alertThreshold ?? 0,
      isActive: defaultValues?.isActive ?? true,
    },
  });

  useEffect(() => {
    reset({
      quantity: defaultValues?.quantity ?? 0,
      alertThreshold: defaultValues?.alertThreshold ?? 0,
      isActive: defaultValues?.isActive ?? true,
    });
  }, [defaultValues, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? "Cập nhật tồn kho"}
      description={subtitle ?? "Chỉnh số lượng và ngưỡng cảnh báo"}
      size="sm"
    >
      <form
        onSubmit={handleSubmit((d) =>
          onSubmit({
            quantity: Number(d.quantity),
            alertThreshold: Number(d.alertThreshold),
            isActive: Boolean(d.isActive),
          }),
        )}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số lượng <span className="text-red-500">*</span>
          </label>
          <input
            {...register("quantity")}
            type="number"
            step="1"
            className={`w-full px-3 py-2 border rounded-xl outline-none transition
              ${errors.quantity ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white"}
              focus:ring-2 focus:ring-primary focus:border-primary`}
            placeholder="0"
          />
          {errors.quantity && (
            <p className="text-rose-600 text-xs mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngưỡng cảnh báo <span className="text-red-500">*</span>
          </label>
          <input
            {...register("alertThreshold")}
            type="number"
            step="1"
            className={`w-full px-3 py-2 border rounded-xl outline-none transition
              ${errors.alertThreshold ? "border-rose-400 bg-rose-50" : "border-gray-200 bg-white"}
              focus:ring-2 focus:ring-primary focus:border-primary`}
            placeholder="0"
          />
          {errors.alertThreshold && (
            <p className="text-rose-600 text-xs mt-1">
              {errors.alertThreshold.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            {...register("isActive")}
            id="isActive"
            type="checkbox"
            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            AVAILABLE (đang bán)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary text-white hover:opacity-90 transition"
          >
            Lưu
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const LowStockHint: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-start gap-3 p-3 rounded-2xl border border-amber-200 bg-amber-50">
    <div className="p-2 rounded-full bg-amber-100">
      <AlertTriangle size={18} className="text-amber-700" />
    </div>
    <div className="text-sm">
      <div className="font-medium text-amber-900">Low stock alert</div>
      <div className="text-amber-800 mt-0.5">
        {text ?? "Các dòng có số lượng <= ngưỡng cảnh báo sẽ được đánh dấu."}
      </div>
    </div>
  </div>
);
