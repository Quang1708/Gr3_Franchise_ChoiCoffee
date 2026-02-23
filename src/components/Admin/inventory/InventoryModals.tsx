import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/UI/Modal";
import { AlertTriangle } from "lucide-react";

export const LowStockHint = ({ text }: { text: string }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-amber-900 flex items-start gap-3">
      <div className="mt-0.5">
        <AlertTriangle size={18} />
      </div>
      <div className="text-sm leading-5">
        <div className="font-semibold">Low stock alert</div>
        <div className="text-amber-800">{text}</div>
      </div>
    </div>
  );
};

type UpdatePayload = {
  quantity: number;
  alertThreshold: number;
  isActive: boolean;
};

export const UpdateInventoryModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  defaultValues,
  onSubmit,
  readOnly,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  defaultValues: UpdatePayload;
  onSubmit: (payload: UpdatePayload) => void;
  readOnly?: boolean;
}) => {
  const [quantity, setQuantity] = useState<number>(defaultValues.quantity);
  const [alertThreshold, setAlertThreshold] = useState<number>(
    defaultValues.alertThreshold,
  );
  const [isActive, setIsActive] = useState<boolean>(defaultValues.isActive);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setQuantity(defaultValues.quantity);
    setAlertThreshold(defaultValues.alertThreshold);
    setIsActive(defaultValues.isActive);
    setErr(null);
  }, [defaultValues, isOpen]);

  const low = useMemo(
    () => quantity <= (alertThreshold || 0),
    [quantity, alertThreshold],
  );

  const validate = () => {
    if (!Number.isFinite(quantity) || quantity < 0) return "Số lượng phải ≥ 0";
    if (!Number.isFinite(alertThreshold) || alertThreshold < 0)
      return "Ngưỡng cảnh báo phải ≥ 0";
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-lg">
      {subtitle ? (
        <div className="text-sm text-gray-600 mb-4">{subtitle}</div>
      ) : null}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Số lượng
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              disabled={readOnly}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Ngưỡng cảnh báo
            </label>
            <input
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              disabled={readOnly}
              className="mt-1 w-full h-10 px-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 p-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">
              Trạng thái
            </div>
            <div className="text-xs text-gray-500">
              {isActive ? "AVAILABLE" : "OUT_OF_STOCK"}
              {low ? " • Low stock" : ""}
            </div>
          </div>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => setIsActive((v) => !v)}
            className={`h-9 px-3 rounded-xl border text-sm font-medium transition ${
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            } ${readOnly ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"}`}
          >
            {isActive ? "Đang bật" : "Đang tắt"}
          </button>
        </div>

        {err ? <div className="text-sm text-rose-700">{err}</div> : null}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
          >
            Đóng
          </button>

          {!readOnly ? (
            <button
              type="button"
              onClick={() => {
                const e = validate();
                if (e) {
                  setErr(e);
                  return;
                }
                onSubmit({ quantity, alertThreshold, isActive });
              }}
              className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition"
            >
              Lưu thay đổi
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
};
