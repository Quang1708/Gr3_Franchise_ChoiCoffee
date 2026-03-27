import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "../../UI/Modal";
import { FormInput } from "@/components/Admin/form/FormInput";
import type { Franchise } from "@/pages/admin/franchise/models/franchise.model";
import { AlertTriangle } from "lucide-react";

/* -------------------------------------------------- */
/* SCHEMA                                             */
/* -------------------------------------------------- */

const franchiseSchema = z
  .object({
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
  })
  .refine((data) => data.opened_at < data.closed_at, {
    message: "Giờ mở phải trước giờ đóng",
    path: ["opened_at"],
  });

type FranchiseFormData = z.infer<typeof franchiseSchema>;

interface FranchiseModalProps {
  defaultValues?: Partial<FranchiseFormData>;
  onSubmit: (data: FranchiseFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel: string;
}

/* -------------------------------------------------- */
/* INPUT STYLE                                        */
/* -------------------------------------------------- */

const inputClass = (error?: boolean) =>
  `w-full px-4 py-2.5 rounded-xl border text-sm transition-all outline-none
   ${
     error
       ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200"
       : "border-gray-200 bg-gray-50 focus:ring-2 focus:ring-primary/20 focus:border-primary"
   }`;

/* -------------------------------------------------- */
/* FRANCHISE MODAL FORM                               */
/* -------------------------------------------------- */

const FranchiseModal: React.FC<FranchiseModalProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    setError,
    clearErrors,
  } = useForm<FranchiseFormData>({
    resolver: zodResolver(franchiseSchema),
    mode: "onChange",
    defaultValues,
  });

  // ✅ reset khi mở modal / đổi data
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    } else {
      reset({
        code: "",
        name: "",
        address: "",
        hotline: "",
        logo_url: "",
        opened_at: "",
        closed_at: "",
      });
    }

    clearErrors();
  }, [defaultValues, reset, clearErrors]);

  const submitHandler = async (data: FranchiseFormData) => {
    try {
      await onSubmit(data);
    } catch (err: any) {
      if (err?.errors?.length) {
        err.errors.forEach((e: any) => {
          setError(e.field || "root", {
            message: e.message,
          });
        });
      } else if (err?.message) {
        setError("root", { message: err.message });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      {/* GLOBAL ERROR */}
      {errors.root && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
          <AlertTriangle size={16} />
          {errors.root.message}
        </div>
      )}

      {/* LOGO */}
      <div className="bg-gray-50 border rounded-xl p-4">
        <p className="text-sm font-semibold mb-3 text-gray-600">
          Logo chi nhánh
        </p>

        <div className="flex justify-center">
          <FormInput
            type="file"
            defaultValue={defaultValues?.logo_url}
            register={register("logo_url")}
            onUploadSuccess={(url) => setValue("logo_url", url)}
          />
        </div>
      </div>

      {/* BASIC INFO */}
      <div className="grid grid-cols-2 gap-4">
        {/* CODE */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Mã chi nhánh <span className="text-red-500">*</span>
          </label>
          <input
            {...register("code")}
            disabled={isSubmitting}
            className={inputClass(!!errors.code)}
          />
          {errors.code && (
            <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
          )}
        </div>

        {/* NAME */}
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Tên chi nhánh <span className="text-red-500">*</span>
          </label>
          <input
            {...register("name")}
            disabled={isSubmitting}
            className={inputClass(!!errors.name)}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* ADDRESS */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          Địa chỉ
        </label>
        <textarea
          {...register("address")}
          disabled={isSubmitting}
          className={`${inputClass(false)} min-h-[80px] resize-none`}
        />
      </div>

      {/* HOTLINE */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-1 block">
          Hotline <span className="text-red-500">*</span>
        </label>
        <input
          {...register("hotline")}
          disabled={isSubmitting}
          className={inputClass(!!errors.hotline)}
        />
        {errors.hotline && (
          <p className="text-red-500 text-xs mt-1">{errors.hotline.message}</p>
        )}
      </div>

      {/* HOURS */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Giờ mở <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            {...register("opened_at")}
            disabled={isSubmitting}
            className={inputClass(!!errors.opened_at)}
          />
          {errors.opened_at && (
            <p className="text-red-500 text-xs mt-1">
              {errors.opened_at.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 mb-1 block">
            Giờ đóng <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            {...register("closed_at")}
            disabled={isSubmitting}
            className={inputClass(!!errors.closed_at)}
          />
          {errors.closed_at && (
            <p className="text-red-500 text-xs mt-1">
              {errors.closed_at.message}
            </p>
          )}
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Đang xử lý..." : submitLabel}
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
      <FranchiseModal
        submitLabel="Tạo"
        onSubmit={onSubmit}
        onCancel={onClose}
      />
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
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật chi nhánh"
      size="md"
    >
      {/* ✅ chỉ render form khi có data */}
      {franchise && (
        <FranchiseModal
          defaultValues={{
            code: franchise.code ?? "",
            name: franchise.name ?? "",
            address: franchise.address ?? "",
            hotline: franchise.hotline ?? "",
            logo_url: franchise.logo_url ?? "",
            opened_at: franchise.opened_at ?? "",
            closed_at: franchise.closed_at ?? "",
          }}
          submitLabel="Lưu"
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      )}
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
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="text-red-600" size={18} />
          </div>

          <div>
            <p className="font-semibold text-gray-800">
              Bạn chắc chắn muốn xóa?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {franchise.name} ({franchise.code})
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            Hủy
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 cursor-pointer"
          >
            Xóa
          </button>
        </div>
      </div>
    </Modal>
  );
};

/* -------------------------------------------------- */
/* RESTORE MODAL                                      */
/* -------------------------------------------------- */

export const RestoreFranchiseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  franchise: Franchise | null;
  onConfirm: () => void;
}> = ({ isOpen, onClose, franchise, onConfirm }) => {
  if (!franchise) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Khôi phục chi nhánh"
      size="sm"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 rounded-full">
            <AlertTriangle className="text-yellow-600" size={18} />
          </div>

          <div>
            <p className="font-semibold text-gray-800">
              Khôi phục chi nhánh này?
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {franchise.name} ({franchise.code})
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            Hủy
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 cursor-pointer"
          >
            Khôi phục
          </button>
        </div>
      </div>
    </Modal>
  );
};
