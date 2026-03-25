import React from "react";
import { X } from "lucide-react";

interface CRUDModalTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  title: string;
  mode: "view" | "edit" | "create" | "checkout";
  isLoading?: boolean;
  children: React.ReactNode;
  maxWidth?: string;
  hideScrollbar?: boolean;
}

export const CRUDModalTemplate = ({
  isOpen,
  onClose,
  onSave,
  title,
  mode,
  isLoading = false,
  children,
  maxWidth = "max-w-2xl", 
  hideScrollbar = false,
}: CRUDModalTemplateProps) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-110 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
    >
      <div
        className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">
            {mode === "view"
              ? `Chi tiết ${title}`
              : mode === "edit"
                ? `Chỉnh sửa ${title}`
                : mode === "checkout"
                  ? `Thanh toán ${title}`
                  : `Thêm mới ${title}`}
          </h3>
          <button
            title="Đóng"
            onClick={onClose}
            className="cursor-pointer p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`flex-1 overflow-y-auto p-6 bg-gray-50/30 ${
            hideScrollbar ? "hide-scrollbar" : ""
          }`}
        >
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mode === "view" ? "Đóng" : "Hủy"}
          </button>

          {mode !== "view" && (
            <button
              type="button" // Đổi thành button thay vì submit để tránh tự reload form nếu bọc trong form
              onClick={onSave}
              disabled={isLoading}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {/* CẬP NHẬT Ở ĐÂY: Thêm label cho mode checkout */}
              {mode === "create"
                ? "Thêm mới"
                : mode === "checkout"
                ? "Thanh toán"
                : "Cập nhật"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};