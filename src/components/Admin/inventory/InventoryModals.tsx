import { Modal } from "@/components/UI/Modal";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { axiosAdminClient } from "@/api";

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
  quantity: z.coerce.number().min(0, "Số lượng phải >= 0").pipe(z.number()),
});

const inputClass = (error?: any) =>
  `w-full px-3 py-2 rounded-lg border outline-none transition
   ${error ? "border-red-500 bg-red-50 focus:ring-red-200" : "border-gray-300"}`;

/* ===============================
   TYPES
================================ */

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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const [franchises, setFranchises] = useState<FranchiseSelect[]>([]);
  const [products, setProducts] = useState<ProductFranchise[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingFranchises, setLoadingFranchises] = useState(false);

  const franchiseId = watch("franchise_id");

  useEffect(() => {
    if (!isOpen) return;

    const fetchFranchises = async () => {
      try {
        setLoadingFranchises(true);

        const res = await axiosAdminClient.get("/api/franchises/select");

        if (res.data?.success) {
          setFranchises(res.data.data);
        }
      } catch (err) {
        console.error("Fetch franchises error:", err);
      } finally {
        setLoadingFranchises(false);
      }
    };

    fetchFranchises();

    /* reset form mỗi lần mở modal */
    reset();
    setProducts([]);
  }, [isOpen, reset]);

  useEffect(() => {
    if (!franchiseId || !isOpen) return;

    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);

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

        if (res.data?.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error("Fetch products error:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [franchiseId, isOpen]);
  /* ================================
     SUBMIT
  ================================= */

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
        {/* FRANCHISE */}

        <div>
          <label className="text-sm font-medium">Chi nhánh</label>

          <select
            {...register("franchise_id")}
            className={inputClass(errors.franchise_id)}
            disabled={loadingFranchises}
          >
            <option value="">
              {loadingFranchises ? "Đang tải chi nhánh..." : "Chọn chi nhánh"}
            </option>

            {franchises.map((f) => (
              <option key={f.value} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>

          {errors.franchise_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.franchise_id.message}
            </p>
          )}
        </div>

        {/* PRODUCT */}

        <div>
          <label className="text-sm font-medium">Sản phẩm</label>

          <select
            {...register("product_id")}
            className={inputClass(errors.product_id)}
            disabled={!franchiseId || loadingProducts}
          >
            <option value="">
              {!franchiseId
                ? "Chọn chi nhánh trước"
                : loadingProducts
                  ? "Đang tải sản phẩm..."
                  : "Chọn sản phẩm"}
            </option>

            {products.map((p) => (
              <option key={p.id} value={p.product_id}>
                {p.product_name} ({p.size})
              </option>
            ))}
          </select>

          {errors.product_id && (
            <p className="text-red-500 text-sm mt-1">
              {errors.product_id.message}
            </p>
          )}
        </div>

        {/* QUANTITY */}

        <div>
          <label className="text-sm font-medium">Số lượng</label>

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

        {/* ALERT */}

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
  inventory: {
    id: string;
    product_franchise_id: string;
    quantity: number;
  } | null;
  onSubmit: (data: {
    product_franchise_id: string;
    change: number;
    reason?: string;
  }) => Promise<void>;
}
export const AdjustInventoryModal: React.FC<AdjustInventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdjustInventoryForm>({
    resolver: zodResolver(adjustInventorySchema),
    defaultValues: {
      quantity: inventory?.quantity ?? 0,
    },
  });

  const newQuantity = watch("quantity");

  useEffect(() => {
    if (inventory && isOpen) {
      reset({
        quantity: inventory.quantity,
      });
    }
  }, [inventory, isOpen, reset]);

  const submitHandler = async (data: AdjustInventoryForm) => {
    if (!inventory) return;

    const change = data.quantity - inventory.quantity;

    await onSubmit({
      product_franchise_id: inventory.product_franchise_id,
      change,
      reason: "",
    });

    reset();
    onClose();
  };

  if (!inventory) return null;

  const changePreview = newQuantity - inventory.quantity;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Điều chỉnh tồn kho">
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        {/* CURRENT QUANTITY */}

        <div className="text-sm text-gray-600">
          Số lượng hiện tại:{" "}
          <span className="font-semibold">{inventory.quantity}</span>
        </div>

        {/* NEW QUANTITY */}

        <div>
          <label className="text-sm font-medium">Số lượng mới</label>

          <input
            type="number"
            {...register("quantity")}
            className={inputClass(errors.quantity)}
          />

          {errors.quantity && (
            <p className="text-red-500 text-sm">{errors.quantity.message}</p>
          )}
        </div>

        {/* CHANGE PREVIEW */}

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

        {/* ACTION */}

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
