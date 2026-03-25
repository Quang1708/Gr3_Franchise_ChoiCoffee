import type { Order } from "@/pages/admin/order/models/searchOrderResponse.model";
import { CRUDModalTemplate } from "../Admin/template/CRUDModal.template";
import { useEffect, useState } from "react";
import { getOrderDetail } from "./services/getOrder.service";
import {
  Loader2,
  ReceiptText,
  Store,
  User,
  CreditCard,
  Package,
  CircleUserRound,
  Ticket,
  Tag,
} from "lucide-react";
import {
  confirmPayment,
} from "./services/confirmPayment.service";
import { getPayment } from "./services/confirmPayment.service";
import { toast } from "react-toastify";
import { ActionConfirmModal } from "../Admin/template/ActionConfirmModal";

export type OrderFormProps = {
  mode: "create" | "edit" | "view" | "checkout";
  isOpen: boolean;
  initialData?: Order;
  onSubmit: (data: any) => void;
  onClose: () => void;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "DRAFT":
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-600">
          Chưa thanh toán
        </span>
      );
    case "ACTIVE":
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-600">
          Đang xử lý
        </span>
      );
    case "CHECKED_OUT":
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-600">
          Đã thanh toán
        </span>
      );
    case "CANCELED":
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-600">
          Đã hủy
        </span>
      );
      case "PREPARING":
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-600">
          Đang chuẩn bị
        </span>
      );
    case "CONFIRMED":
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-600">
          Đã xác nhận
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600">
          {status}
        </span>
      );
  }
};

const OrderForm = (props: OrderFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // BIẾN KIỂM TRA MODE VIEW
  const isViewMode = props.mode === "view";

  const fetchOrderDetail = async () => {
    if (!props.initialData?._id) return;
    try {
      setIsLoading(true);
      const response = await getOrderDetail(props.initialData._id);
      if (response?.success && response?.data) {
        setFormData(response.data);
      } else if (response?._id) {
        setFormData(response as any);
      }
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (props.isOpen && props.initialData?._id) {
      fetchOrderDetail();
    }
  }, [props.isOpen, props.initialData]);

  const handlePayment = async () => {
    const toastId = toast.loading("Đang xác nhận thanh toán...");
    if (!formData?._id) return;
    try {
      const payment = await getPayment(formData._id);
      if (payment) {
        const response = await confirmPayment(payment.data._id, paymentMethod);
        if (response) {
          toast.update(toastId, {
            render: "Xác nhận thanh toán thành công",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
          fetchOrderDetail();
          setIsModalOpen(false)
        }
      }
    } catch (error) {
      console.log("Lỗi khi xác nhận thanh toán:", error);
      toast.update(toastId, {
        render: "Lỗi khi xác nhận thanh toán",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  const handelConfirm = () => {
    // Chặn click nếu đang ở mode view (đề phòng an toàn)
    if (isViewMode) return; 

    if (formData && formData.status === "DRAFT") {
      setIsModalOpen(true);
    }
  };

  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wider";

  return (
    <CRUDModalTemplate
      title="Chi tiết đơn hàng"
      mode={props.mode === "edit" ? "checkout" : props.mode}
      isOpen={props.isOpen}
      onClose={props.onClose}
      onSave={handelConfirm}
      maxWidth="max-w-7xl"
    >
      {isLoading ? (
        <Loader2
          size={48}
          className="animate-spin text-primary mx-auto my-20"
        />
      ) : !formData ? (
        <div className="h-[60vh] flex items-center justify-center text-gray-400">
          Không tìm thấy thông tin đơn hàng
        </div>
      ) : (
        <div className="flex-1 p-6 flex flex-col lg:flex-row gap-8 overflow-hidden h-150 lg:h-[70vh]">
          {/* CỘT TRÁI: THÔNG TIN ĐƠN & DANH SÁCH SẢN PHẨM */}
          <div className="flex-[1.5] flex flex-col min-h-0">
            {/* KHU VỰC HEADER TĨNH (Không cuộn) */}
            <div className="shrink-0 flex flex-col gap-5 mb-3 pr-2">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[11px] text-gray-500 uppercase font-bold tracking-wider mb-1">
                    Mã đơn hàng
                  </p>
                  <h2 className="text-xl font-black text-gray-800 dark:text-zinc-100">
                    {formData.code}
                  </h2>
                </div>
                {getStatusBadge(formData.status)}
              </div>

              <div className={`${labelClass} flex items-center gap-2`}>
                <Package size={18} className="text-primary" /> Danh sách món (
                {formData.order_items?.length || 0})
              </div>
            </div>

            {/* KHU VỰC DANH SÁCH MÓN (Có cuộn dọc) */}
            <div className="pt-2 flex-1 overflow-y-auto pr-3 space-y-4 custom-scroll border-r border-gray-50 dark:border-zinc-800/50">
              {formData.order_items?.map((item) => (
                <div
                  key={item.order_item_id}
                  className="group relative flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 hover:shadow-md hover:bg-primary/5 transition-shadow bg-white dark:bg-zinc-900/50"
                >
                  <img
                    src={item.product_image_url || "/placeholder.jpg"}
                    alt={item.product_name}
                    className="w-20 h-20 rounded-lg object-cover bg-gray-100 shrink-0"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                        {item.product_name}
                      </h4>
                      <p className="font-bold text-primary whitespace-nowrap ml-2">
                        {item.final_line_total.toLocaleString()}đ
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        Số lượng: x{item.quantity}
                      </span>
                      <span className="text-xs text-zinc-400 italic">
                        Đơn giá: {item.price_snapshot.toLocaleString()}đ
                      </span>
                    </div>

                    {item.discount_amount > 0 && (
                      <div className="mt-1 text-xs text-red-500 font-medium">
                        Giảm giá: -{item.discount_amount.toLocaleString()}đ
                      </div>
                    )}

                    {/* OPTIONS/TOPPING */}
                    {item.options && item.options.length > 0 && (
                      <div className="mt-4 space-y-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">
                          Topping / Tùy chọn
                        </p>
                        {item.options.map((opt: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                              + {opt.product_name}
                            </span>
                            <div className="flex items-center gap-2">
                              {opt.discount_amount > 0 ? (
                                <span className="text-xs text-zinc-400">
                                  +
                                  {(
                                    opt.final_line_total / opt.quantity
                                  ).toLocaleString()}
                                  đ
                                </span>
                              ) : null}
                              <span className="w-6 text-center text-[11px] font-bold">
                                x{opt.quantity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: THÔNG TIN ĐƠN & THANH TOÁN */}
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 custom-scroll">
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <div
                className={`${labelClass} mb-4 flex items-center gap-2 uppercase tracking-wider`}
              >
                <User size={18} className="text-primary" /> Khách hàng & Chi
                nhánh
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                    <User size={14} />
                  </div>
                  <span className="font-medium">
                    {formData.customer_name || "Khách vãng lai"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                    <Store size={14} />
                  </div>
                  <span className="font-medium">{formData.franchise_name}</span>
                </div>

                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm shrink-0">
                    <CircleUserRound size={14} />
                  </div>
                  <div>
                    <span className="font-medium block">
                      {formData.staff_name}
                    </span>
                    <span className="text-xs italic text-gray-400">
                      {formData.staff_email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {formData.status !== "CHECKED_OUT" &&
              formData.status !== "CANCELED" && (
                <div className={`bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm shrink-0 ${isViewMode ? "opacity-80" : ""}`}>
                  <div
                    className={`${labelClass} flex items-center gap-2 uppercase tracking-wider text-[11px]`}
                  >
                    <span className="material-symbols-outlined text-primary text-lg">
                      payments
                    </span>
                    <h2 className="text-xs font-bold text-gray-500 whitespace-nowrap">
                      Phương thức thanh toán
                    </h2>
                  </div>

                  <div className="flex flex-row gap-3 overflow-x-auto py-1 custom-scroll pb-2">
                    {[
                      { id: "CASH", label: "Tiền mặt", icon: "payments", color: "text-amber-500" },
                      { id: "CARD", label: "Thẻ ATM", icon: "credit_card", color: "text-blue-500" },
                      { id: "MOMO", label: "Ví Momo", icon: "account_balance_wallet", color: "text-[#A50064]" },
                      { id: "VNPAY", label: "VNPAY", icon: "qr_code_scanner", color: "text-[#005BAA]" },
                    ].map((pm) => (
                      <label
                        key={pm.id}
                        // CẬP NHẬT: Thay đổi giao diện con trỏ khi ở mode view
                        className={`flex items-center gap-2 p-2 px-3 border transition-all rounded-lg shrink-0
                        ${isViewMode ? "cursor-default grayscale-[50%]" : "cursor-pointer"}
                        ${
                          paymentMethod === pm.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : isViewMode
                              ? "border-slate-100" 
                              : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="relative flex items-center justify-center shrink-0">
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentMethod === pm.id}
                            onChange={() => !isViewMode && setPaymentMethod(pm.id)}
                            disabled={isViewMode} // KHÓA CLICK CHUỘT
                            className={`appearance-none size-4 rounded-full border-2 border-slate-300 checked:border-primary ${isViewMode ? "cursor-default" : "cursor-pointer"}`}
                          />
                          {paymentMethod === pm.id && (
                            <div className="absolute size-2 bg-primary rounded-full animate-in zoom-in duration-200"></div>
                          )}
                        </div>
                        <div
                          className={`size-7 rounded-full bg-slate-50 flex items-center justify-center shrink-0 ${pm.color}`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {pm.icon}
                          </span>
                        </div>
                        <span className="text-[13px] font-semibold text-gray-700 whitespace-nowrap">
                          {pm.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

            {/* Chi tiết thanh toán */}
            <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
              <div className={`${labelClass} mb-4 flex items-center gap-2`}>
                <ReceiptText size={18} className="text-primary" /> Thanh toán
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-500">
                  <span>Tạm tính</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {(formData.subtotal_amount ?? 0).toLocaleString()}đ
                  </span>
                </div>

                {formData.promotion_discount > 0 && (
                  <div className="flex justify-between text-zinc-500 italic">
                    <div className="flex items-center gap-1">
                      <Tag size={14} /> Khuyến mãi
                    </div>
                    <span className="text-red-500">
                      -{(formData.promotion_discount ?? 0).toLocaleString()}đ
                    </span>
                  </div>
                )}

                {formData.voucher_discount > 0 && (
                  <div className="flex justify-between text-zinc-500 italic">
                    <div className="flex items-center gap-1">
                      <Ticket size={14} /> Voucher
                    </div>
                    <span className="text-red-500">
                      -{(formData.voucher_discount ?? 0).toLocaleString()}đ
                    </span>
                  </div>
                )}

                {formData.loyalty_discount > 0 && (
                  <div className="flex justify-between text-zinc-500 italic border-b pb-3">
                    <div className="flex items-center gap-1">
                      <CreditCard size={14} /> Điểm tích lũy
                    </div>
                    <span className="text-red-500">
                      -{(formData.loyalty_discount ?? 0).toLocaleString()}đ
                    </span>
                  </div>
                )}

                <div className="pt-3 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="text-base font-bold">Tổng cộng</span>
                    <span className="text-2xl font-black text-primary">
                      {(formData.final_amount ?? 0).toLocaleString()}đ
                    </span>
                  </div>
                  <p className="text-[10px] text-right text-zinc-400 uppercase tracking-wider">
                    Đã bao gồm VAT
                  </p>
                </div>
              </div>
            </div>
             <ActionConfirmModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            type="confirm"
            message="Bạn có muốn xác nhận thanh toán, hãy kiểm tra lại các thông tin "
            onConfirm={handlePayment}
          />
          </div>
         
        </div>
      )}
    </CRUDModalTemplate>
  );
};

export default OrderForm;