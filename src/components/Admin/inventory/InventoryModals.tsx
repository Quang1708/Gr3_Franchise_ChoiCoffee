import { Modal } from "@/components/UI/Modal";
import { useForm } from "react-hook-form";
import { AlertTriangle } from "lucide-react";

interface CreateInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    product_franchise_id: string;
    quantity: number;
    alert_threshold: number;
  }) => Promise<void>;
}

export const CreateInventoryModal: React.FC<CreateInventoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { register, handleSubmit, reset } = useForm<{
    product_franchise_id: string;
    quantity: number;
    alert_threshold: number;
  }>();

  const submitHandler = async (data: {
    product_franchise_id: string;
    quantity: number;
    alert_threshold: number;
  }) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo tồn kho">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Product Franchise ID</label>
          <input
            {...register("product_franchise_id", { required: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Số lượng</label>
          <input
            type="number"
            {...register("quantity", { required: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Ngưỡng cảnh báo</label>
          <input
            type="number"
            {...register("alert_threshold", { required: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />
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
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Tạo
          </button>
        </div>
      </form>
    </Modal>
  );
};

interface AdjustInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { inventoryId: string; quantity: number }) => Promise<void>;
  inventoryId: string | null;
}

export const AdjustInventoryModal: React.FC<AdjustInventoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  inventoryId,
}) => {
  const { register, handleSubmit, reset } = useForm<{ quantity: number }>();

  const submitHandler = async (data: { quantity: number }) => {
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
            {...register("quantity", { required: true })}
            className="w-full border px-3 py-2 rounded-lg"
          />
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
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Cập nhật
          </button>
        </div>
      </form>
    </Modal>
  );
};

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
            <p className="font-medium">Bạn chắc chắn muốn xóa?</p>

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
