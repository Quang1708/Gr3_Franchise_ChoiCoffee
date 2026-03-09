import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../UI/Modal";
import type { Franchise } from "@/pages/admin/franchise/models/franchise.model";
import { AlertTriangle } from "lucide-react";

/* -------------------------------------------------- */
/* SCHEMA                                             */
/* -------------------------------------------------- */

const franchiseSchema = z.object({
  code: z.string().min(1, "Mã chi nhánh là bắt buộc"),
  name: z.string().min(1, "Tên chi nhánh là bắt buộc"),
  address: z.string().optional(),
  hotline: z
    .string()
    .min(1, "Hotline là bắt buộc")
    .regex(/^[0-9]+$/, "Hotline chỉ được chứa số"),
  logo_url: z.string().optional(),
  opened_at: z
    .string()
    .min(1, "Giờ mở cửa là bắt buộc")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Giờ phải theo format HH:mm"),
  closed_at: z
    .string()
    .min(1, "Giờ đóng cửa là bắt buộc")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Giờ phải theo format HH:mm"),
});

type FranchiseFormData = z.infer<typeof franchiseSchema>;

interface FranchiseFormProps {
  defaultValues?: Partial<FranchiseFormData>;
  onSubmit: (data: FranchiseFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel: string;
}

/* -------------------------------------------------- */
/* FORM                                               */
/* -------------------------------------------------- */

const FranchiseForm: React.FC<FranchiseFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FranchiseFormData>({
    resolver: zodResolver(franchiseSchema),
    defaultValues,
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Code */}
      <div>
        <label className="block text-sm font-medium mb-1">Mã chi nhánh *</label>
        <input
          {...register("code")}
          className="w-full border px-3 py-2 rounded-lg"
        />
        {errors.code && (
          <p className="text-red-500 text-xs">{errors.code.message}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Tên chi nhánh *
        </label>
        <input
          {...register("name")}
          className="w-full border px-3 py-2 rounded-lg"
        />
        {errors.name && (
          <p className="text-red-500 text-xs">{errors.name.message}</p>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-1">Địa chỉ</label>
        <textarea
          {...register("address")}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* Hotline */}
      <div>
        <label className="block text-sm font-medium mb-1">Hotline *</label>
        <input
          {...register("hotline")}
          className="w-full border px-3 py-2 rounded-lg"
        />
        {errors.hotline && (
          <p className="text-red-500 text-xs">{errors.hotline.message}</p>
        )}
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium mb-1">Logo URL</label>
        <input
          {...register("logo_url")}
          className="w-full border px-3 py-2 rounded-lg"
        />
      </div>

      {/* Hours */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Giờ mở *</label>
          <input
            type="time"
            {...register("opened_at")}
            placeholder="08:00"
            className="w-full border px-3 py-2 rounded-lg"
          />
          {errors.opened_at && (
            <p className="text-red-500 text-xs">{errors.opened_at.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Giờ đóng *</label>
          <input
            type="time"
            {...register("closed_at")}
            placeholder="22:00"
            className="w-full border px-3 py-2 rounded-lg"
          />
          {errors.closed_at && (
            <p className="text-red-500 text-xs">{errors.closed_at.message}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

/* -------------------------------------------------- */
/* CREATE MODAL                                       */
/* -------------------------------------------------- */

export const CreateFranchiseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FranchiseFormData) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm chi nhánh" size="md">
      <FranchiseForm submitLabel="Tạo" onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  );
};

/* -------------------------------------------------- */
/* EDIT MODAL                                         */
/* -------------------------------------------------- */

export const EditFranchiseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  onSubmit: (data: FranchiseFormData) => void;
}> = ({ isOpen, onClose, franchise, onSubmit }) => {
  if (!franchise) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật chi nhánh"
      size="md"
    >
      <FranchiseForm
        defaultValues={{
          code: franchise.code,
          name: franchise.name,
          address: franchise.address,
          hotline: franchise.hotline,
          logo_url: franchise.logo_url,
          opened_at: franchise.opened_at,
          closed_at: franchise.closed_at,
        }}
        submitLabel="Lưu"
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

/* -------------------------------------------------- */
/* DELETE MODAL                                       */
/* -------------------------------------------------- */

export const DeleteFranchiseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  onConfirm: () => void;
}> = ({ isOpen, onClose, franchise, onConfirm }) => {
  if (!franchise) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xóa chi nhánh" size="sm">
      <div className="space-y-4">
        <div className="flex gap-3">
          <AlertTriangle className="text-red-600" />
          <div>
            <p className="font-medium">Bạn chắc chắn muốn xóa?</p>
            <p className="text-sm text-gray-600">
              {franchise.name} ({franchise.code})
            </p>
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
