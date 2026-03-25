type CartHeaderProps = {
  count: number;
};

const CartHeader = ({ count }: CartHeaderProps) => {
  return (
    <div className="flex items-baseline justify-between mb-8 border-b border-slate-200">
      <h1 className="text-xl font-bold uppercase tracking-tight text-charcoal-800">
        Giỏ hàng
      </h1>
      <span className="text-[14px] text-charcoal-400 tabular-nums">
        {count} sản phẩm
      </span>
    </div>
  );
};

export default CartHeader;
