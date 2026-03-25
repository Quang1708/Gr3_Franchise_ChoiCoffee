import type { OrderListRow } from "../models";
import OrderCard from "./OrderCard";

type OrderListProps = {
  orders: OrderListRow[];
  isLoading: boolean;
  onOpenOrder: (id: string) => void;
  onActionOrder: (order: OrderListRow) => void;
  onBuyNow: () => void;
};

const OrderCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 animate-pulse h-full flex flex-col">
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
      <div className="mt-2 h-3 w-1/3 bg-gray-100 rounded"></div>
      <div className="mt-1 h-3 w-2/5 bg-gray-100 rounded"></div>
      <div className="mt-4 h-3 w-20 bg-gray-100 rounded"></div>
      <div className="mt-2 h-8 bg-gray-100 rounded"></div>
      <div className="mt-2 h-8 bg-gray-100 rounded"></div>
      <div className="mt-auto pt-4 h-10 w-28 bg-gray-200 rounded"></div>
    </div>
  );
};

const OrderList = ({
  orders,
  isLoading,
  onOpenOrder,
  onActionOrder,
  onBuyNow,
}: OrderListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <OrderCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
        <p className="text-lg font-semibold text-charcoal">
          Bạn chưa có đơn hàng nào
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Hãy mua sắm để bắt đầu đơn hàng đầu tiên của bạn.
        </p>
        <button
          type="button"
          onClick={onBuyNow}
          className="mt-4 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Mua ngay
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onOpen={onOpenOrder}
          onAction={onActionOrder}
        />
      ))}
    </div>
  );
};

export default OrderList;
