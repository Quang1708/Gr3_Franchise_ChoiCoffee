import ClientLoading from "@/components/Client/Client.Loading";
import { RotateCcw, Trash2, X, Loader2, Check } from "lucide-react";

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "delete" | "restore" | "confirm";
  title?: string;
  message?: string;
  isLoading?: boolean;
}

export const ActionConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  message,
  isLoading = false,
}: ActionConfirmModalProps) => {
  if (!isOpen) return null;

  const isDelete = type === "delete";
  const isConfirm = type === "confirm";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => !isLoading && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            {title || (isDelete ? "Xác nhận xóa" : "Xác nhận khôi phục")}
          </h3>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-md text-gray-500 hover:text-red-500 hover:bg-red-100 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-8 flex flex-col items-center text-center gap-4 min-h-[140px] justify-center">
          {isLoading ? (
            <ClientLoading />
          ) : (
            <>
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-full
                                    ${isDelete ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}
              >
                {isDelete && <Trash2 className="w-7 h-7" />}{" "}
                {isConfirm && <Check className="w-7 h-7" />}{" "}
                {!isDelete && !isConfirm && <RotateCcw className="w-7 h-7" />}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                {message ||
                  (isDelete
                    ? "Bạn có chắc chắn muốn xóa mục này không?"
                    : isConfirm
                      ? "Bạn có chắc chắn muốn xác nhận hành động này không?"
                      : "Bạn có chắc chắn muốn khôi phục mục này không?")}
              </p>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          >
            Hủy
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg transition active:scale-95 disabled:opacity-60
                            ${isDelete ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
