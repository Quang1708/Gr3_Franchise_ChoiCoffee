import { Modal } from "@/components/UI/Modal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

/* ===============================
   SCHEMA
================================ */

const schema = z.object({
  product_id: z.string().min(1, "Sản phẩm bắt buộc"),

  franchise_id: z.string().min(1, "Chi nhánh bắt buộc"),

  quantity: z.coerce.number().min(0, "Số lượng phải >= 0"),

  alert_threshold: z.coerce.number().min(0, "Ngưỡng cảnh báo phải >= 0"),
});

const adjustInventorySchema = z.object({
  quantity: z.coerce.number().min(0, "Số lượng phải >= 0"),
});

/* ===============================
   TYPES
================================ */

type FormData = z.infer<typeof schema>;
type AdjustInventoryForm = z.infer<typeof adjustInventorySchema>;

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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [products, setProducts] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);

  /* ===============================
     MOCK API
  ================================ */

  useEffect(() => {
    setProducts([
      { id: "p1", name: "Coca Cola" },
      { id: "p2", name: "Pepsi" },
    ]);

    setFranchises([
      { id: "f1", name: "Quận 1" },
      { id: "f2", name: "Quận 3" },
    ]);
  }, []);

  /* ===============================
     SUBMIT
  ================================ */

  const submitHandler = async (data: FormData) => {
    const product_franchise_id = `${data.product_id}_${data.franchise_id}`;

    await onSubmit({
      product_franchise_id,
      quantity: data.quantity,
      alert_threshold: data.alert_threshold,
    });

    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo tồn kho">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        {/* PRODUCT */}

        <div>
          <label className="text-sm font-medium">Sản phẩm</label>

          <select
            {...register("product_id")}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Chọn sản phẩm</option>

            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {errors.product_id && (
            <p className="text-red-500 text-sm">{errors.product_id.message}</p>
          )}
        </div>

        {/* FRANCHISE */}

        <div>
          <label className="text-sm font-medium">Chi nhánh</label>

          <select
            {...register("franchise_id")}
            className="w-full border px-3 py-2 rounded-lg"
          >
            <option value="">Chọn chi nhánh</option>

            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
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

        {/* QUANTITY */}

        <div>
          <label className="text-sm font-medium">Số lượng</label>

          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />

          {errors.quantity && (
            <p className="text-red-500 text-sm">{errors.quantity.message}</p>
          )}
        </div>

        {/* ALERT */}

        <div>
          <label className="text-sm font-medium">Ngưỡng cảnh báo</label>

          <input
            type="number"
            {...register("alert_threshold", { valueAsNumber: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />

          {errors.alert_threshold && (
            <p className="text-red-500 text-sm">
              {errors.alert_threshold.message}
            </p>
          )}
        </div>

        {/* ACTION */}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-white px-4 py-2 rounded-lg"
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

interface AdjustInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryId: string | null;
  onSubmit: (data: { inventoryId: string; quantity: number }) => Promise<void>;
}

export const AdjustInventoryModal: React.FC<AdjustInventoryModalProps> = ({
  isOpen,
  onClose,
  inventoryId,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdjustInventoryForm>({
    resolver: zodResolver(adjustInventorySchema),
  });

  const submitHandler = async (data: AdjustInventoryForm) => {
    if (!inventoryId) return;

    await onSubmit({
      inventoryId,
      quantity: data.quantity,
    });

    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Điều chỉnh tồn kho">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Số lượng mới</label>

          <input
            type="number"
            {...register("quantity", { valueAsNumber: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />

          {errors.quantity && (
            <p className="text-red-500 text-sm">{errors.quantity.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Hủy
          </button>

          <button
            disabled={isSubmitting}
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg"
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
