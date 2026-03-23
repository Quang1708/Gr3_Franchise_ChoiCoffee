/* eslint-disable @typescript-eslint/no-explicit-any */
import { Modal } from "@/components/UI/Modal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { axiosAdminClient } from "@/api";
import { useAdminContextStore } from "@/stores/adminContext.store";
import { useInventoryStore } from "@/pages/admin/inventory/stores/useInventoryStore";

/* ===============================
SCHEMA
================================ */

const schema = z.object({
  product_id: z.string().min(1, "Sản phẩm bắt buộc"),
  franchise_id: z.string().min(1, "Chi nhánh bắt buộc"),
  quantity: z.number().min(0, "Số lượng phải >= 0"),
  alert_threshold: z.number().min(0, "Ngưỡng cảnh báo phải >= 0"),
});

const adjustInventorySchema = z.object({
  quantity: z.number().min(0, "Số lượng phải >= 0"),
  alert_threshold: z.number().min(0, "Ngưỡng cảnh báo phải >= 0"),
});

/* ===============================
COMMON
================================ */

const inputClass = (error?: any) =>
  `w-full px-3 py-2 rounded-lg border outline-none transition
   ${error ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300"}`;

type FormData = z.infer<typeof schema>;
type AdjustInventoryForm = z.infer<typeof adjustInventorySchema>;

type ProductFranchise = {
  id: string;
  product_id: string;
  product_name: string;
  franchise_id: string;
  franchise_name: string;
  size: string;
  price_base: number;
};

type FranchiseSelect = {
  value: string;
  code: string;
  name: string;
};

/* ===============================
CREATE INVENTORY MODAL
================================ */

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    product_franchise_id: string;
    quantity: number;
    alert_threshold: number;
  }) => Promise<void>;
}

export const CreateInventoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );

  const isAdminGlobal = !selectedFranchiseId || selectedFranchiseId === "ALL";

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange", // 🔥 realtime validate
    defaultValues: {
      franchise_id: "",
      product_id: "",
      quantity: 0,
      alert_threshold: 0,
    },
  });

  const franchiseId = isAdminGlobal
    ? watch("franchise_id")
    : String(selectedFranchiseId);

  const [franchises, setFranchises] = useState<FranchiseSelect[]>([]);
  const [products, setProducts] = useState<ProductFranchise[]>([]);

  useEffect(() => {
    if (!isOpen || !isAdminGlobal) return;

    const fetchFranchises = async () => {
      const res = await axiosAdminClient.get("/api/franchises/select");
      if (res.data?.success) setFranchises(res.data.data);
    };

    fetchFranchises();
  }, [isOpen, isAdminGlobal]);

  useEffect(() => {
    if (!isOpen || !franchiseId) return;

    const fetchProducts = async () => {
      const res = await axiosAdminClient.post(
        "/api/product-franchises/search",
        {
          searchCondition: {
            franchise_id: franchiseId,
            is_deleted: false,
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 50,
          },
        },
      );

      if (res.data?.success) setProducts(res.data.data);
    };

    fetchProducts();
  }, [franchiseId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    reset({
      franchise_id: isAdminGlobal ? "" : String(selectedFranchiseId),
      product_id: "",
      quantity: 0,
      alert_threshold: 0,
    });

    setProducts([]);
  }, [isOpen]);

  const submitHandler = async (data: FormData) => {
    const selected = products.find((p) => p.product_id === data.product_id);
    if (!selected) return;

    await onSubmit({
      product_franchise_id: selected.id,
      quantity: data.quantity,
      alert_threshold: data.alert_threshold,
    });

    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo tồn kho">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        {isAdminGlobal && (
          <div>
            <label>Chi nhánh</label>
            <select
              {...register("franchise_id")}
              className={inputClass(errors.franchise_id)}
            >
              <option value="">Chọn chi nhánh</option>
              {franchises.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.name}
                </option>
              ))}
            </select>
            {errors.franchise_id && (
              <p className="text-red-500 text-sm">
                {errors.franchise_id.message}
              </p>
            )}
          </div>
        )}

        <div>
          <label>Sản phẩm</label>
          <select
            {...register("product_id")}
            className={inputClass(errors.product_id)}
          >
            <option value="">Chọn sản phẩm</option>
            {products.map((p) => (
              <option key={p.id} value={p.product_id}>
                {p.product_name} ({p.size})
              </option>
            ))}
          </select>
          {errors.product_id && (
            <p className="text-red-500 text-sm">{errors.product_id.message}</p>
          )}
        </div>

        <div>
          <label>Số lượng</label>
          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            className={inputClass(errors.quantity)}
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm">{errors.quantity.message}</p>
          )}
        </div>

        <div>
          <label>Ngưỡng cảnh báo</label>
          <input
            type="number"
            {...register("alert_threshold", { valueAsNumber: true })}
            className={inputClass(errors.alert_threshold)}
          />
          {errors.alert_threshold && (
            <p className="text-red-500 text-sm">
              {errors.alert_threshold.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}>
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
    px-4 py-2 rounded-lg font-medium text-sm transition-all
    ${
      isSubmitting
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-primary text-white hover:bg-primary/90 active:scale-95 shadow-sm hover:shadow-md cursor-pointer"
    }
  `}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ===============================
ADJUST INVENTORY MODAL
================================ */

export const AdjustInventoryModal = ({
  isOpen,
  onClose,
  inventory,
  onSubmit,
}: any) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdjustInventoryForm>({
    resolver: zodResolver(adjustInventorySchema),
    mode: "onChange",
    defaultValues: {
      quantity: 0,
      alert_threshold: 0,
    },
  });

  // ✅ luôn gọi hook trước
  const newQuantity = watch("quantity", inventory?.quantity ?? 0);
  const newAlert = watch("alert_threshold", inventory?.alert_threshold ?? 0);

  const changePreview = (newQuantity ?? 0) - (inventory?.quantity ?? 0);
  const alertChanged = newAlert !== inventory?.alert_threshold;
  const quantityChanged = changePreview !== 0;

  useEffect(() => {
    if (inventory && isOpen) {
      reset({
        quantity: inventory.quantity,
        alert_threshold: inventory.alert_threshold,
      });
    }
  }, [inventory, isOpen, reset]);

  // ✅ return sau khi đã gọi hook
  if (!inventory) return null;

  const submitHandler = async (data: AdjustInventoryForm) => {
    const change = data.quantity - inventory.quantity;

    await onSubmit({
      product_franchise_id: inventory.product_franchise_id,
      change,
      alert_threshold: data.alert_threshold,
    });

    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Điều chỉnh tồn kho">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div className="text-sm text-gray-600">
          Số lượng hiện tại:{" "}
          <span className="font-semibold">{inventory.quantity}</span>
        </div>

        <div>
          <label className="text-sm font-medium">Số lượng mới</label>
          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            className={inputClass(errors.quantity)}
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Ngưỡng cảnh báo</label>
          <input
            type="number"
            {...register("alert_threshold", { valueAsNumber: true })}
            className={inputClass(errors.alert_threshold)}
          />
          {errors.alert_threshold && (
            <p className="text-red-500 text-sm mt-1">
              {errors.alert_threshold.message}
            </p>
          )}
        </div>

        <div className="text-sm">
          Thay đổi:{" "}
          <span
            className={`font-semibold ${
              changePreview > 0
                ? "text-green-600"
                : changePreview < 0
                  ? "text-red-600"
                  : "text-gray-600"
            }`}
          >
            {changePreview > 0 ? `+${changePreview}` : changePreview}
          </span>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose}>
            Hủy
          </button>

          <button
            type="submit"
            disabled={isSubmitting || (!alertChanged && !quantityChanged)}
            className={`
    px-4 py-2 rounded-lg font-medium text-sm transition-all
    ${
      isSubmitting || (!alertChanged && !quantityChanged)
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-sm hover:shadow-md"
    }
  `}
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/* ===============================
DELETE INVENTORY MODAL
================================ */

interface DeleteInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: {
    id: string;
    ingredientName: string;
  } | null;
  onConfirm: () => void;
}

export const DeleteInventoryModal: React.FC<DeleteInventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onConfirm,
}) => {
  if (!inventory) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xóa tồn kho" size="sm">
      <div className="space-y-4">
        <div className="flex gap-3">
          <AlertTriangle className="text-red-600" />

          <div>
            <p className="font-medium">Bạn chắc chắn muốn xóa tồn kho?</p>
            <p className="text-sm text-gray-600">{inventory.ingredientName}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">
            Hủy
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg"
          >
            Xóa
          </button>
        </div>
      </div>
    </Modal>
  );
};

interface InventoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryId: string | null;
}

export const InventoryLogModal: React.FC<InventoryLogModalProps> = ({
  isOpen,
  onClose,
  inventoryId,
}) => {
  const { logs, fetchLogs, logsLoading } = useInventoryStore();

  useEffect(() => {
    if (!inventoryId) return;

    fetchLogs(inventoryId);
  }, [inventoryId, fetchLogs]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inventory Logs" size="xl">
      <div className="max-h-[500px] overflow-auto">
        {logsLoading ? (
          <div className="text-center py-10 text-gray-500">
            Loading inventory logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Không có lịch sử thay đổi
          </div>
        ) : (
          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Change</th>
                <th className="px-4 py-3 text-left">Reason</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log: any, i) => {
                const type =
                  log.change > 0
                    ? "IMPORT"
                    : log.change < 0
                      ? "EXPORT"
                      : "UPDATE";

                return (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded font-medium
                        ${
                          type === "IMPORT"
                            ? "bg-green-100 text-green-700"
                            : type === "EXPORT"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {type}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-3 font-semibold
                      ${
                        log.change > 0
                          ? "text-green-600"
                          : log.change < 0
                            ? "text-red-600"
                            : ""
                      }`}
                    >
                      {log.change > 0 ? `+${log.change}` : log.change}
                    </td>

                    <td className="px-4 py-3">{log.reason || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
};
