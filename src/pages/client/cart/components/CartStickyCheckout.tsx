import ButtonSubmit from "@components/Client/Button/ButtonSubmit";
import type { OrderItem } from "@/models/order_item.model";

type CartStickyCheckoutProps = {
  orderCount: number;
  orderItems: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountBreakdown?: Array<{
    label: string;
    amount: number;
  }>;
  finalTotal: number;
  onSubmit: () => void;
};

const CartStickyCheckout = ({
  orderCount,
  orderItems,
  subtotal,
  discountAmount,
  discountBreakdown = [],
  finalTotal,
  onSubmit,
}: CartStickyCheckoutProps) => {
  return (
    <div className="relative mt-4 rounded-md border border-slate-200 bg-white">
      <div className="max-w-350 mx-auto px-4 py-4 md:py-6 ml-5 mr-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col gap-2 text-left">
          <div className="flex flex-col leading-tight">
            <span className="text-base text-charcoal">Tổng thanh toán</span>
            <span className="text-[14px] text-charcoal">
              ({orderCount} sản phẩm)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-2xl md:text-[26px] font-bold text-primary tabular-nums leading-none">
              {finalTotal.toLocaleString()}
              <span className="text-xl align-super">₫</span>
            </span>

            {discountAmount > 0 && (
              <span className="text-slate-400 line-through tabular-nums">
                {subtotal.toLocaleString()}₫
              </span>
            )}

            {discountBreakdown.map((discount) => (
              <span
                key={`${discount.label}-${discount.amount}`}
                className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-600"
              >
                -{discount.amount.toLocaleString()}₫ ({discount.label})
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end md:justify-end">
          <ButtonSubmit
            label="Thanh toán"
            disabled={orderItems.length === 0}
            onClick={onSubmit}
            className="w-full! md:w-52.5! uppercase font-bold tracking-wider cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default CartStickyCheckout;
