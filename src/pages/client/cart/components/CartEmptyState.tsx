import ButtonSubmit from "@components/Client/Button/ButtonSubmit";

type CartEmptyStateProps = {
  onBackToMenu: () => void;
};

const CartEmptyState = ({ onBackToMenu }: CartEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute size-48 bg-slate-200/40 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-center">
          <span className="material-symbols-outlined text-charcoal font-light">
            shopping_cart_off
          </span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-charcoal font-bold mb-2">
        Giỏ hàng của bạn đang trống
      </h3>
      <p className="text-[14px] text-charcoal mb-10 max-w-xs text-center leading-relaxed">
        Hãy thêm những sản phẩm tuyệt vời từ ChoiCoffee để bắt đầu đơn hàng của
        chi nhánh.
      </p>
      <ButtonSubmit
        label="Quay lại thực đơn"
        onClick={onBackToMenu}
        className="!w-auto px-12 !py-3 shadow-xl shadow-primary/10"
      />
    </div>
  );
};

export default CartEmptyState;
