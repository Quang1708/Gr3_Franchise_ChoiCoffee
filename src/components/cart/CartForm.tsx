import { CRUDModalTemplate } from "../Admin/template/CRUDModal.template";
import {
  Plus,
  ShoppingCart,
  MapPin,
  Phone,
  User,
  Tag,
  ReceiptText,
  PencilLine,
  Check,
  Trash,
  Minus,
  Loader2,
} from "lucide-react";

import { useCartForm, type CartFormProps } from "./hooks/useCartForm";
import { useEffect, useState } from "react";
import { updateCartAddress } from "./usecase/updateCartAdress.usecase";
import { toast } from "react-toastify";
import { getCartDetail } from "./usecase/getCartDetail.usecase";
import type { CartData } from "./models/cartDetail.model";
import { updateQuantityItem } from "./usecase/updateItemQuantity.usecase";
import { deleteItem } from "./usecase/deleteItem.usecase";
import { updateOptionQuantity } from "./usecase/updateQuantityOption.usecase";
import { deleteOption } from "./usecase/deleteOption.usecase";
// import type { AddOptionRequest } from "./services/addOption.service";
import { ActionConfirmModal } from "../Admin/template/ActionConfirmModal";
import { checkoutCart } from "./usecase/checkoutCart.usecase";
import { useAdminContextStore } from "@/stores";
import { useAuthStore } from "@/stores/auth.store";
import { createPortal } from "react-dom";
import { addOption } from "./usecase/addOption.usecase";
import type { AddOptionRequest } from "./services/addOption.service";
import { getCustomer } from "./services/getCustome.service";
import CartVoucherModal from "@/pages/client/cart/components/CartVoucherModal";
import type { CartVoucher } from "@/pages/client/cart/models/cartVoucher.model";
import { getVouchersByFranchiseId } from "@/services/voucher.service";
import { applyVoucherCart11Service } from "@/pages/client/cart/services/cart11.service";
import { removeVoucherCart12Service } from "@/pages/client/cart/services/cart12.service";


const CartForm = (props: CartFormProps) => {
  const [customerInfor, setCustomerInfor] = useState<any | null>(null);
  const { state, form, handlers, initialData } = useCartForm(props);
  const isViewMode = props.mode === "view";
  const canEditExistingCart = props.mode === "edit";
  const [cart, setCart] = useState<CartData | null>(
    initialData ? (initialData as any) : null,
  );

  const selectedFranchiseId = useAdminContextStore(
    (s) => s.selectedFranchiseId,
  );
  const adminFranchises = useAdminContextStore((s) => s.franchises);
  const user = useAuthStore((s) => s.user);
  const isAdmin =
    user?.roles?.some((r) => (r.role ?? r.role_code) === "ADMIN") ?? false;
  const shouldLockFranchise =
    props.mode === "create" && isAdmin && !!selectedFranchiseId;

  useEffect(() => {
    if (!props.isOpen || props.mode !== "create" || !shouldLockFranchise)
      return;
    if (state.franchiseSelected?.id === selectedFranchiseId) return;

    const selected = adminFranchises.find((f) => f.id === selectedFranchiseId);
    handlers.setFranchiseSelected(
      selected
        ? { id: selected.id, name: selected.name, code: selected.code }
        : { id: selectedFranchiseId as string, name: "", code: "" },
    );
    form.setValue("franchise_id", selectedFranchiseId as string);
    form.setValue("product_franchise_id", "");
    handlers.setProductFranchiseSelected(null);
    handlers.setProductFranchiseCache([]);
    handlers.setToppingSelected({});
    // Intentionally keep deps minimal to avoid re-triggering on unstable handler object identities.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.isOpen,
    props.mode,
    shouldLockFranchise,
    selectedFranchiseId,
    adminFranchises,
    state.franchiseSelected?.id,
  ]);

  const [loading, setLoading] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherOptions, setVoucherOptions] = useState<CartVoucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<CartVoucher | null>(
    null,
  );
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);
  const [tempData, setTempData] = useState({
    phone: initialData?.phone || "",
    address: initialData?.address || "",
  });

  const fetchCartDetailData = async () => {
    if (!initialData?._id) return;
    try {
      const response = await getCartDetail(initialData._id);
      {
        setCart(response.data);
        setTempData({
          phone: response.data.phone || "",
          address: response.data.address || "",
        });
      }
    } catch (error) {
      console.log("Lỗi khi lấy chi tiết giỏ hàng:", error);
    }
  };

  const handleUpdateQuantityItem = async (
    cart_item_id: string,
    quantity: number,
  ) => {
    const toastId = toast.loading("Đang cập nhật số lượng...");
    try {
      const response = await updateQuantityItem(cart_item_id, quantity);
      if (response.success) {
        await fetchCartDetailData();
        toast.update(toastId, {
          render: "Đang cập nhật số lượng...",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
      } else {
        toast.update(toastId, {
          render: "Cập nhật số lượng thất bại",
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi cập nhật số lượng sản phẩm",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    }
  };

  const handleDeleteItem = async (cart_item_id: string) => {
    const toastId = toast.loading("Đang xóa sản phẩm...");
    try {
      const response = await deleteItem(cart_item_id);
      if (response.success) {
        toast.update(toastId, {
          render: "Xóa sản phẩm thành công",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        fetchCartDetailData();
      }
    } catch (error) {
      console.error("Lỗi khi xóa mục giỏ hàng:", error);
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi xóa mục giỏ hàng",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    }
  };

  const handleUpdateOptionQuantity = async (
    cart_item_id: string,
    option_product_franchise_id: string,
    quantity: number,
  ) => {
    const toastId = toast.loading("Đang xử cập nhật số lượng...");
    try {
      const response = await updateOptionQuantity({
        cart_item_id,
        option_product_franchise_id,
        quantity,
      });
      if (response.success) {
        toast.update(toastId, {
          render: "Cập nhật số lượng tùy chọn thành công",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        fetchCartDetailData();
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng tùy chọn:", error);
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi cập nhật số lượng tùy chọn",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    }
  };

  const handleRemoveOption = async (
    cart_item_id: string,
    option_product_franchise_id: string,
  ) => {
    const toastId = toast.loading("Đang xử lý");
    try {
      const response = await deleteOption(
        cart_item_id,
        option_product_franchise_id,
      );
      if (response.success) {
        toast.update(toastId, {
          render: "Xóa topping thành công",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        fetchCartDetailData();
      }
    } catch (error) {
      console.error("Lỗi khi xóa tùy chọn:", error);
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi xóa tùy chọn",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    }
  };

  useEffect(() => {
    if ((props.mode === "edit" || props.mode === "view") && props.initialData?._id) {
      const fetchCartDetail = async () => {
        const cartId = props.initialData?._id;
        if (!cartId) return;
        setLoading(true);
        try {
          const response = await getCartDetail(cartId);
          {
            setCart(response.data);
            setTempData({
              phone: response.data.phone || "",
              address: response.data.address || "",
            });
          }
        } catch (error) {
          console.log("Lỗi khi lấy chi tiết giỏ hàng:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchCartDetail();
    }
  }, [props.isOpen, props.mode, props.initialData?._id]);

  const handleAddOptions = async (data: AddOptionRequest) => {
    const toastId = toast.loading("Đang thêm tùy chọn...");
    try {
      const response = await addOption(data);
      if (response.success) {
        toast.update(toastId, {
          render: "Thêm tùy chọn thành công",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        fetchCartDetailData();
      }
    } catch (error) {
      console.error("Lỗi khi thêm tùy chọn:", error);
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi thêm tùy chọn",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    }
  };

  const handleUpdateInformation = async () => {
    const toastId = toast.loading("Đang xử lý");
    if (!cart?._id) return;
    if (tempData.phone === cart.phone && tempData.address === cart.address) {
      toast.update(toastId, {
        render: "Không có thay đổi nào để cập nhật",
        type: "info",
        isLoading: false,
        autoClose: 1500,
      });
      return;
    }

    if (!tempData.phone || !tempData.address) {
      toast.update(toastId, {
        render: "Vui lòng điền đầy đủ thông tin trước khi cập nhật",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
      return;
    }
    try {
      const response = await updateCartAddress(
        cart._id,
        tempData.address,
        tempData.phone,
        "",
      );
      if (response) {
        await fetchCartDetailData();
        toast.update(toastId, {
          render: "Cập nhật thông tin thành công",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi cập nhật thông tin",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    }
  };

  const refreshVoucherOptions = async (franchiseId?: string) => {
    const targetFranchiseId = franchiseId || cart?.franchise_id || "";
    if (!targetFranchiseId) {
      setVoucherOptions([]);
      return [] as CartVoucher[];
    }
    console.log(targetFranchiseId);
    setIsLoadingVouchers(true);
    try {
      const vouchers = await getVouchersByFranchiseId(targetFranchiseId);
      console.log(vouchers);
      const now = Date.now();
      const mapped = vouchers
        .map(
          (item) =>
            ({
              id: String(item.id),
              code: item.code,
              type: item.type,
              value: Number(item.value ?? 0),
              startTime: item.startTime,
              endTime: item.endTime,
              quotaTotal: Number(item.quotaTotal ?? 0),
              quotaUsed: Number(item.quotaUsed ?? 0),
              isActive: Boolean(item.isActive),
            }) satisfies CartVoucher,
        )
        .filter((voucher) => {
          if (!voucher.isActive) return false;

          const remainingQuota = voucher.quotaTotal - voucher.quotaUsed;
          if (remainingQuota <= 0) return false;

          const startAt = voucher.startTime
            ? new Date(voucher.startTime).getTime()
            : null;
          if (startAt !== null && Number.isFinite(startAt) && now < startAt) {
            return false;
          }

          const endAt = voucher.endTime ? new Date(voucher.endTime).getTime() : null;
          if (endAt !== null && Number.isFinite(endAt) && now > endAt) {
            return false;
          }

          return true;
        });

      setVoucherOptions(mapped);
      return mapped;
    } catch {
      setVoucherOptions([]);
      return [] as CartVoucher[];
    } finally {
      setIsLoadingVouchers(false);
    }
  };

  const handleOpenVoucherModal = async () => {
    if (isViewMode) return;
    if (!cart?._id) {
      toast.error("Không tìm thấy giỏ hàng để áp dụng voucher");
      return;
    }

    setIsVoucherModalOpen(true);
    const vouchers = await refreshVoucherOptions(cart.franchise_id);
    if (cart.voucher_code) {
      const matched = vouchers.find((voucher) => voucher.code === cart.voucher_code);
      setSelectedVoucher(matched ?? null);
    } else {
      setSelectedVoucher(null);
    }
  };

  const handleApplyVoucher = async (voucher: CartVoucher) => {
    if (!cart?._id) return;

    const toastId = toast.loading("Đang áp dụng voucher...");
    setIsApplyingVoucher(true);
    try {
      const response = await applyVoucherCart11Service(cart._id, voucher.code);
      const isSuccess = Boolean(
        response &&
          typeof response === "object" &&
          "success" in (response as Record<string, unknown>)
          ? (response as { success?: unknown }).success
          : true,
      );

      if (!isSuccess) {
        toast.update(toastId, {
          render: "Không thể áp dụng voucher",
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
        return;
      }

      setSelectedVoucher(voucher);
      await fetchCartDetailData();
      setIsVoucherModalOpen(false);
      toast.update(toastId, {
        render: "Áp dụng voucher thành công",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    } catch {
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi áp dụng voucher",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = async () => {
    if (isViewMode) return;
    if (!cart?._id) return;

    const toastId = toast.loading("Đang gỡ voucher...");
    setIsApplyingVoucher(true);
    try {
      const response = await removeVoucherCart12Service(cart._id);
      const isSuccess = Boolean(
        response &&
          typeof response === "object" &&
          "success" in (response as Record<string, unknown>)
          ? (response as { success?: unknown }).success
          : true,
      );

      if (!isSuccess) {
        toast.update(toastId, {
          render: "Không thể gỡ voucher",
          type: "error",
          isLoading: false,
          autoClose: 1500,
        });
        return;
      }

      setSelectedVoucher(null);
      await fetchCartDetailData();
      toast.update(toastId, {
        render: "Gỡ voucher thành công",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    } catch {
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi gỡ voucher",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const onSubmitCheckout = async () => {
    if (!cart?._id) return;
    if (!tempData.phone || !tempData.address) {
      toast.error("Vui lòng điền đầy đủ thông tin trước khi thanh toán");
      return;
    }
    const toastId = toast.loading("Đang xử lý thanh toán...");
    try {
      const response = await checkoutCart(cart._id, {
        address: tempData.address,
        phone: tempData.phone,
        message: "",
      });

      if (response.success) {
        toast.update(toastId, {
          render: "Thanh toán thành công",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
        setIsCheckout(false);
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      toast.update(toastId, {
        render: "Có lỗi xảy ra khi thanh toán",
        type: "error",
        isLoading: false,
        autoClose: 1500,
      });
    }
  };

  useEffect(() => {
    const fetchCustomerInfor = async () => {
      if (!cart?.customer_id) return;
      try{
        const res = await getCustomer(cart.customer_id);
        setCustomerInfor(res.data);
      }catch(error){
        console.log(error);
      }
    }
    fetchCustomerInfor();
  }, [cart?.customer_id]);

  useEffect(() => {
    if (!cart?.voucher_code) {
      setSelectedVoucher(null);
      return;
    }

    const matched = voucherOptions.find((voucher) => voucher.code === cart.voucher_code);
    if (matched) {
      setSelectedVoucher(matched);
    }
  }, [cart?.voucher_code, voucherOptions]);

  const handleModalSave = () => {
    if (isViewMode) return;
    if (props.mode === "edit") {
      setIsCheckout(true);
    } else {
      if (handlers.handleFinalSubmit) {
        handlers.handleFinalSubmit();
      }
    }
  };

  
  const labelClass = "text-xs font-bold text-gray-500 uppercase tracking-wider";
  return (
    <CRUDModalTemplate
      isOpen={props.isOpen}
      title="đơn hàng"
      onClose={props.onClose}
      onSave={handleModalSave}
      mode={props.mode}
      isLoading={props.isLoading}
      maxWidth="max-w-7xl"
    >
      <>
        {loading ? (
          <Loader2
            size={48}
            className="animate-spin text-primary mx-auto my-20"
          />
        ) : (
          <div className="flex-1 p-6 flex flex-col lg:flex-row gap-8 overflow-hidden h-150 lg:h-[70vh]">
            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM - Tự scroll nội bộ */}
            <div className="flex-[1.5] flex flex-col min-h-0">
              <div className={`${labelClass} mb-4 flex items-center gap-2`}>
                <ShoppingCart size={18} className="text-primary" /> Đơn hàng (
                {cart?.cart_items?.length || 0} món)
              </div>
              <div className="pt-3 flex-1 overflow-y-auto pr-2 space-y-4 custom-scroll border-r border-gray-50 dark:border-zinc-800/50 ">
                {cart?.cart_items?.map((item) => {
                  const availableToppings = state.toppingOptions.filter(
                    (topping) =>
                      !item.options.some(
                        (opt) => opt.product_franchise_id === topping.value,
                      ),
                  );

                  return (
                    <div
                      key={item.cart_item_id}
                      className=" group relative flex gap-4 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 hover:shadow-md hover:bg-primary/10 transition-shadow bg-white dark:bg-zinc-900/50"
                    >
                      {canEditExistingCart && (
                        <button
                          title="Xóa món khỏi giỏ hàng"
                          onClick={() => handleDeleteItem(item.cart_item_id)}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                        >
                          <Trash size={16} />
                        </button>
                      )}

                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-20 h-20 rounded-lg object-cover bg-gray-100 shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                            {item.product.name}
                          </h4>
                          <p className="font-bold text-primary whitespace-nowrap ml-2">
                            {item.final_line_total.toLocaleString()}đ
                          </p>
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          {isViewMode ? (
                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                              Số lượng: {item.quantity}
                            </span>
                          ) : (
                            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden h-8">
                              <button
                                title="Giảm số lượng"
                                disabled={item.quantity <= 1}
                                onClick={() =>
                                  handleUpdateQuantityItem(
                                    item.cart_item_id,
                                    item.quantity - 1,
                                  )
                                }
                                className="px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-10 text-center text-sm font-bold border-x border-zinc-200 dark:border-zinc-700">
                                {item.quantity}
                              </span>
                              <button
                                title="Tăng số lượng"
                                onClick={() =>
                                  handleUpdateQuantityItem(
                                    item.cart_item_id,
                                    item.quantity + 1,
                                  )
                                }
                                className="px-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          )}
                          <span className="text-xs text-zinc-400 italic">
                            Đơn giá: {item.product_cart_price.toLocaleString()}đ
                          </span>
                        </div>

                        {/* OPTIONS/TOPPING */}
                        {(item.options.length > 0 ||
                          item.options.length === 0) && (
                          <div className="mt-4 space-y-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase">
                              Topping / Tùy chọn
                            </p>
                            {item.options.map((opt, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center group/opt"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {opt.product.name}
                                  </span>
                                </div>

                                {/* BỘ TĂNG GIẢM OPTION (API Update Quantity Option) */}
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-zinc-400">
                                    +
                                    {(
                                      opt.final_price * opt.quantity
                                    ).toLocaleString()}
                                    đ
                                  </span>
                                  {isViewMode ? (
                                    <span className="text-[11px] font-bold text-zinc-500">
                                      x{opt.quantity}
                                    </span>
                                  ) : (
                                    <>
                                      <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-900 h-6">
                                        <button
                                          title="Giảm số lượng topping"
                                          disabled={opt.quantity <= 1}
                                          onClick={() =>
                                            handleUpdateOptionQuantity(
                                              item.cart_item_id,
                                              opt.product_franchise_id,
                                              opt.quantity - 1,
                                            )
                                          }
                                          className="px-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        >
                                          <Minus size={10} />
                                        </button>
                                        <span className="w-6 text-center text-[11px] font-bold">
                                          {opt.quantity}
                                        </span>
                                        <button
                                          title="Tăng số lượng topping"
                                          onClick={() =>
                                            handleUpdateOptionQuantity(
                                              item.cart_item_id,
                                              opt.product_franchise_id,
                                              opt.quantity + 1,
                                            )
                                          }
                                          className="px-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                        >
                                          <Plus size={10} />
                                        </button>
                                      </div>
                                      {/* Nút Xóa Option (API Remove Option) */}
                                      <button
                                        title="Xóa topping khỏi món"
                                        onClick={() =>
                                          handleRemoveOption(
                                            item.cart_item_id,
                                            opt.product_franchise_id,
                                          )
                                        }
                                        className="text-red-300 hover:text-red-600 transition-colors"
                                      >
                                        <Trash size={12} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Nút Thêm Option */}
                            {!isViewMode && (
                              <div className="relative mt-2">
                                <button
                                  onClick={() =>
                                    setActivePopover(
                                      activePopover === item.cart_item_id
                                        ? null
                                        : item.cart_item_id,
                                    )
                                  }
                                  className="w-full py-1.5 border border-dashed border-primary/40 text-primary text-[11px] font-bold rounded hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
                                >
                                  <Plus size={12} /> Thêm Topping
                                </button>

                                {/* --- PHẦN POPOVER ĐÃ ĐƯỢC SỬA BẰNG PORTAL --- */}
                                {activePopover === item.cart_item_id &&
                                  typeof window !== "undefined" &&
                                  createPortal(
                                    <>
                                      <div
                                        className="fixed inset-0 z-9998 bg-black/5 dark:bg-black/40"
                                        onClick={() => setActivePopover(null)}
                                      />

                                      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-2xl z-9999 overflow-hidden animate-in zoom-in-95 duration-200">
                                        <div className="p-3 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-800/50">
                                          <span className="text-xs font-bold uppercase text-gray-500">
                                            Chọn Topping thêm
                                          </span>
                                          <button
                                            title="Đóng"
                                            onClick={() => setActivePopover(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                          >
                                            <Plus
                                              size={14}
                                              className="rotate-45"
                                            />
                                          </button>
                                        </div>

                                        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scroll">
                                          {/* BƯỚC 2: RENDER RA TỪ DANH SÁCH ĐÃ LỌC (availableToppings) */}
                                          {availableToppings.length > 0 ? (
                                            availableToppings.map((topping) => (
                                              <button
                                                key={topping.value}
                                                onClick={() => {
                                                  const currentOptions =
                                                    item.options.map((opt) => ({
                                                      product_franchise_id:
                                                        opt.product_franchise_id,
                                                      quantity: opt.quantity,
                                                    }));

                                                  const updatedOptions = [
                                                    ...currentOptions,
                                                    {
                                                      product_franchise_id:
                                                        topping.value,
                                                      quantity: 1,
                                                    },
                                                  ];
                                                  handleAddOptions({
                                                    cart_item_id:
                                                      item.cart_item_id,
                                                    options: updatedOptions,
                                                  });
                                                  setActivePopover(null);
                                                }}
                                                className="w-full flex items-center gap-3 p-2 hover:bg-primary/5 rounded-lg transition-colors group"
                                              >
                                                <img
                                                  src={
                                                    topping.product_data.image_url
                                                  }
                                                  className="w-10 h-10 rounded object-cover border border-gray-100"
                                                  alt=""
                                                />
                                                <div className="flex-1 text-left">
                                                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">
                                                    {topping.product_data.name}
                                                  </p>
                                                  <p className="text-[10px] text-gray-400">
                                                    +
                                                    {topping.product_data.price.toLocaleString()}
                                                    đ
                                                  </p>
                                                </div>
                                                <Plus
                                                  size={14}
                                                  className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                />
                                              </button>
                                            ))
                                          ) : (
                                            <p className="text-[10px] text-center py-4 text-gray-400 italic">
                                              Không còn topping khả dụng
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </>,
                                    document.body,
                                  )}
                              </div>
                            )}
                          </div>
                        )}

                        {item.note && (
                          <p className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 p-2 rounded mt-2 italic border border-orange-100 dark:border-orange-900/30">
                            "{item.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: THÔNG TIN KHÁCH HÀNG & THANH TOÁN - Dài hơn và cố định */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 custom-scroll">
              {/* Khách hàng */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className={`mb-4 flex items-center justify-between`}>
                  <div
                    className={`${labelClass} flex items-center gap-2 uppercase tracking-wider text-[11px]`}
                  >
                    <User size={18} className="text-primary" /> Khách hàng
                  </div>

                  {canEditExistingCart && (
                    <button
                      title="Cập nhật sdt và địa chỉ"
                      type="button"
                      onClick={() => {
                        if (!isEditing) {
                          setTempData({
                            phone: customerInfor.phone || "",
                            address: customerInfor?.address || "",
                          });
                        }
                        setIsEditing(!isEditing);
                      }}
                      className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <PencilLine size={14} />
                    </button>
                  )}
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                      <User size={14} />
                    </div>
                    <span className="font-medium">{cart?.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm">
                      <Phone size={14} />
                    </div>
                    {isEditing && canEditExistingCart ? (
                      <input
                        title="Cập nhật số điện thoại"
                        type="text"
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none"
                        value={tempData.phone}
                        onChange={(e) =>
                          setTempData({ ...tempData, phone: e.target.value })
                        }
                      />
                    ) : (
                      <span>{cart?.phone}</span>
                    )}
                  </div>
                  <div className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm shrink-0">
                      <MapPin size={14} />
                    </div>
                    {isEditing && canEditExistingCart ? (
                      <textarea
                        title="Cập nhật địa chỉ"
                        className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 focus:ring-1 focus:ring-primary outline-none min-h-15"
                        value={tempData.address}
                        onChange={(e) =>
                          setTempData({
                            ...tempData,
                            address: e.target.value,
                          })
                        }
                      />
                    ) : (
                      <span className="leading-relaxed">{cart?.address}</span>
                    )}
                  </div>
                  {isEditing && canEditExistingCart && (
                    <div className="flex gap-2 pt-2 justify-end">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold hover:bg-zinc-100 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdateInformation}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1"
                      >
                        <Check size={14} /> Cập nhật
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chi tiết thanh toán */}

              <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                <div className={`${labelClass} mb-4 flex items-center gap-2`}>
                  <ReceiptText size={18} className="text-primary" /> Thanh toán
                </div>
                {/* Voucher */}
                <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm mb-6">
                  <div className={`${labelClass} mb-4 flex items-center gap-2`}>
                    <Tag size={18} className="text-primary" /> Mã giảm giá
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Nhập mã voucher..."
                        readOnly
                        disabled={isViewMode || !!cart?.voucher_discount} // Khóa nếu ở mode xem hoặc đã có voucher
                        className={`w-full pl-3 pr-10 py-2 border rounded-lg outline-none text-sm transition-all ${
                          cart?.voucher_code
                            ? "bg-green-50 border-green-200 text-green-700 font-bold"
                            : "border-gray-200 focus:border-primary"
                        }`}
                        value={cart?.voucher_code ?? ""}
                        onChange={() => {}}
                      />
                      {(cart?.voucher_discount ?? 0) > 0 && (
                        <Check
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                        />
                      )}
                    </div>

                    {!isViewMode && (cart?.voucher_discount ?? 0) > 0 ? (
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        Xóa
                      </button>
                    ) : !isViewMode ? (
                      <button
                        type="button"
                        onClick={handleOpenVoucherModal}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all active:scale-95"
                      >
                        Áp dụng
                      </button>
                    ) : null}
                  </div>

                  {/* Hiển thị tên voucher nếu có */}
                  {cart && cart.voucher_discount != null && (
                    <p className="mt-2 text-[10px] text-green-600 font-medium">
                      Đã áp dụng mã: {cart.voucher_code}
                    </p>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-zinc-500">
                    <span>Tạm tính</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {(cart?.subtotal_amount ?? 0).toLocaleString()}đ
                    </span>
                  </div>
                  {cart?.voucher_discount !== 0 ? (
                    <div className="flex justify-between text-zinc-500 italic">
                      <div className="flex items-center gap-1">
                        <Tag size={14} /> Giảm giá Voucher
                      </div>
                      <span className="text-red-500">
                        -{(cart?.voucher_discount ?? 0).toLocaleString()}đ
                      </span>
                    </div>
                  ) : null}

                  {cart?.promotion_value !== 0 ? (
                    <div className="flex justify-between text-zinc-500 italic">
                      <div className="flex items-center gap-1">
                        <Tag size={14} /> Khuyến mãi
                      </div>
                      <span className="text-green-500">
                        -{cart?.promotion_value ?? 0}%
                      </span>
                    </div>
                  ) : null}
                  {/* <div className="flex justify-between text-zinc-500 italic border-b pb-3">
                    <span>Loyalty Points</span>
                    <span className="text-red-500">
                      -{(cart?.loyalty_discount ?? 0).toLocaleString()}đ
                    </span>
                  </div> */}
                  <div className="pt-3 flex flex-col gap-1">
                    <div className="flex justify-between items-center text-zinc-500">
                      <span className="text-base font-bold">Tổng cộng</span>
                      <span className="text-2xl font-black text-primary">
                        {(cart?.final_amount ?? 0).toLocaleString()}đ
                      </span>
                    </div>
                    <p className="text-[10px] text-right text-zinc-400 uppercase tracking-wider">
                      Đã bao gồm VAT
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* BODY CONTAINER: Đặt chiều cao cố định tại đây */}
        <ActionConfirmModal
          isOpen={isCheckout}
          onClose={() => setIsCheckout(false)}
          type="confirm"
          title="Xác nhận đơn hàng"
          message="Bạn có chắc chắn muốn xác nhận hàng này không? Vui lòng kiểm tra kỹ thông tin trước khi xác nhận."
          onConfirm={onSubmitCheckout}
        />

        <CartVoucherModal
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          isLoading={isLoadingVouchers || isApplyingVoucher}
          vouchers={voucherOptions}
          selectedVoucher={selectedVoucher}
          onApply={(voucher) => {
            void handleApplyVoucher(voucher);
          }}
        />
      </>
    </CRUDModalTemplate>
  );
};

export default CartForm;
