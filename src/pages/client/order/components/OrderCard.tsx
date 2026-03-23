import { ImageOff } from "lucide-react";
import type { ClientOrderStatus, OrderListRow } from "../models";

type OrderCardProps = {
  order: OrderListRow;
  onOpen: (id: string) => void;
  onAction: (order: OrderListRow) => void;
};

type StatusMeta = {
  label: string;
  className: string;
};

const getStatusMeta = (status: ClientOrderStatus): StatusMeta => {
  if (status === "draft") {
    return {
      label: "Chưa hoàn tất",
      className: "bg-slate-500/15 text-slate-600 border-slate-400/30",
    };
  }

  if (status === "confirmed" || status === "preparing") {
    return {
      label: "Đã xác nhận",
      className: "bg-blue-500/20 text-blue-500 border-blue-500/30",
    };
  }

  if (status === "ready_for_pickup" || status === "out_for_delivery") {
    return {
      label: "Đang giao đến bạn",
      className: "bg-orange-500/20 text-orange-500 border-orange-500/30",
    };
  }

  if (status === "completed") {
    return {
      label: "Hoàn thành",
      className: "bg-green-500/20 text-green-500 border-green-500/30",
    };
  }

  return {
    label: "Đã hủy",
    className: "bg-red-500/20 text-red-500 border-red-500/30",
  };
};

const getActionLabel = (status: ClientOrderStatus): string | null => {
  if (status === "draft") return "Tiếp tục đặt hàng";
  if (status === "ready_for_pickup" || status === "out_for_delivery")
    return "Theo dõi đơn";
  if (status === "completed") return "Mua lại";
  if (status === "canceled") return "Đặt lại";
  return null;
};

const OrderCard = ({ order, onOpen, onAction }: OrderCardProps) => {
  const statusMeta = getStatusMeta(order.status);
  const actionLabel = getActionLabel(order.status);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(order.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(order.id);
        }
      }}
      className="w-full h-full text-left bg-white rounded-lg border border-gray-200 shadow-sm p-3 md:p-4 hover:shadow-md hover:border-primary/30 transition-all flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold text-charcoal line-clamp-1">
          {order.franchiseName}
        </p>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusMeta.className}`}
        >
          {statusMeta.label}
        </span>
      </div>

      <div className="mt-2 text-xs md:text-sm text-gray-600 space-y-1">
        <p className="font-semibold text-charcoal">#{order.orderCode}</p>
        <p>
          {order.orderDate} - {order.orderTime}
        </p>
      </div>

      <div className="mt-3 min-h-[88px]">
        <p className="text-xs font-medium text-gray-500 mb-1.5">Sản phẩm</p>
        {order.itemPreview.length > 0 ? (
          <div className="space-y-1.5">
            {order.itemPreview.map((item, index) => (
              <div
                key={`${order.id}-${index}`}
                className="flex items-center gap-1.5"
              >
                <div className="w-7 h-7 rounded-md border border-gray-200 bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageOff size={12} className="text-gray-400" />
                  )}
                </div>
                <p className="text-xs md:text-sm text-charcoal truncate">
                  {item.name} x{item.quantity}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Không có dữ liệu sản phẩm</p>
        )}
      </div>

      <div className="mt-auto pt-3 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-gray-500">Tổng tiền</p>
          <p className="text-base md:text-lg font-black text-primary">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(order.totalAmount)}
          </p>
        </div>

        {actionLabel ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAction(order);
            }}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs md:text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default OrderCard;
