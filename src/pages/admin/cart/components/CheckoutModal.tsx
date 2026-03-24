import { useState, useEffect } from "react";
import { X, CreditCard, Search, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { axiosAdminClient } from "@/api";
import { checkoutCartService } from "@/components/cart/services/checkoutCart.service";
import { FormInput } from "@/components/Admin/form/FormInput";
import { getCustomerDetailUsecase } from "@/pages/admin/customer/usecases/getCustomerDetail.usecase";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    cart: any[];
    cartId: string;
    total: number;
    onConfirm: (customerInfo: any) => void;
    onSuccess?: () => void;
}

interface CheckoutFormData {
    name: string;
    phone: string;
    address: string;
    message: string;
}

interface CustomerData {
    value: string;
    code: string;
    name: string;
    email: string;
    phone: string;
    image: string;
}

const CheckoutModal = ({ isOpen, onClose, cart, cartId, total, onConfirm, onSuccess }: CheckoutModalProps) => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<CheckoutFormData>({
        defaultValues: {
            name: "",
            phone: "",
            address: "",
            message: ""
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchPhone, setSearchPhone] = useState("");
    const [showCustomerList, setShowCustomerList] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
    const [customers, setCustomers] = useState<CustomerData[]>([]);
    const [searching, setSearching] = useState(false);
    const [loadingCustomerDetail, setLoadingCustomerDetail] = useState(false);

    const watchedPhone = watch("phone");
    const watchedAddress = watch("address");

    // Tìm kiếm khách hàng theo keyword (số điện thoại, tên, email)
    const searchCustomers = async (keyword: string) => {
        if (!keyword || keyword.length < 3) {
            setCustomers([]);
            return;
        }

        setSearching(true);
        try {
            const response = await axiosAdminClient.get(`/api/customers/find`, {
                params: { keyword: keyword }
            });

            if (response.data?.success && response.data?.data) {
                setCustomers(response.data.data);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error("Lỗi tìm kiếm khách hàng:", error);
            setCustomers([]);
        } finally {
            setSearching(false);
        }
    };

    // Lấy chi tiết khách hàng (bao gồm địa chỉ)
    const getCustomerDetail = async (customerId: string) => {
        setLoadingCustomerDetail(true);
        try {
            const response = await getCustomerDetailUsecase(customerId);
            if (response.success) {
                return response.data;
            }
            return null;
        } catch (error) {
            console.error("Lỗi lấy chi tiết khách hàng:", error);
            return null;
        } finally {
            setLoadingCustomerDetail(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchPhone) {
                searchCustomers(searchPhone);
            } else {
                setCustomers([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchPhone]);

    if (!isOpen) return null;

    const handleSelectCustomer = async (customer: CustomerData) => {
        setSelectedCustomer(customer);
        setValue("name", customer.name || "");
        setValue("phone", customer.phone || "");

        // Lấy thêm thông tin chi tiết (địa chỉ)
        const customerDetail = await getCustomerDetail(customer.value);
        if (customerDetail?.address) {
            setValue("address", customerDetail.address);
        } else {
            setValue("address", "");
        }

        setSearchPhone(""); // Xóa text tìm kiếm
        setShowCustomerList(false);
        setCustomers([]); // Xóa danh sách kết quả
    };

    const handleClearCustomer = () => {
        setSelectedCustomer(null);
        setValue("name", "");
        setValue("phone", "");
        setValue("address", "");
        setSearchPhone("");
        setCustomers([]);
        setShowCustomerList(false);
    };

    const onSubmit = async (data: CheckoutFormData) => {
        if (!data.phone || !data.address) {
            alert("Vui lòng nhập số điện thoại và địa chỉ");
            return;
        }

        setIsSubmitting(true);
        try {
            const checkoutData = {
                address: data.address,
                phone: data.phone,
                message: data.message
            };

            await checkoutCartService(cartId, checkoutData);

            if (onConfirm) {
                await onConfirm({
                    ...data,
                    isExistingCustomer: !!selectedCustomer,
                    customerId: selectedCustomer?.value
                });
            }

            if (onSuccess) {
                onSuccess();
            }

            onClose();
            // Reset form
            setValue("name", "");
            setValue("phone", "");
            setValue("address", "");
            setValue("message", "");
            setSelectedCustomer(null);
            setSearchPhone("");
            setCustomers([]);

        } catch (error: any) {
            console.error("Checkout error:", error);
            alert(error?.response?.data?.message || "Có lỗi xảy ra khi đặt hàng");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">Xác nhận đơn hàng</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex">
                    {/* LEFT SIDE - Customer Info */}
                    <div className="w-1/2 border-r border-gray-100 overflow-y-auto p-5">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Tìm kiếm khách hàng */}
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchPhone}
                                        onChange={(e) => {
                                            setSearchPhone(e.target.value);
                                            setShowCustomerList(true);
                                            if (e.target.value === "") {
                                                handleClearCustomer();
                                            }
                                        }}
                                        onFocus={() => setShowCustomerList(true)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder="Tìm khách hàng theo số điện thoại, tên hoặc email"
                                    />
                                    {searching && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                                    )}
                                    {selectedCustomer && !searching && searchPhone === "" && (
                                        <button
                                            type="button"
                                            onClick={handleClearCustomer}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Danh sách khách hàng tìm thấy */}
                                {showCustomerList && searchPhone && customers.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {customers.map((customer) => (
                                            <button
                                                key={customer.value}
                                                type="button"
                                                onClick={() => handleSelectCustomer(customer)}
                                                className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                                            >
                                                <p className="text-sm font-medium text-gray-800">
                                                    {customer.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {customer.phone} {customer.email && `• ${customer.email}`}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Loading khi lấy chi tiết khách hàng */}
                                {loadingCustomerDetail && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                            <span className="text-sm text-gray-500">Đang tải thông tin...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Form thông tin khách hàng */}
                            <FormInput
                                label="Số điện thoại"
                                type="tel"
                                register={register("phone", {
                                    required: "Vui lòng nhập số điện thoại",
                                    pattern: {
                                        value: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                                        message: "Số điện thoại không hợp lệ"
                                    }
                                })}
                                error={errors.phone}
                                placeholder="Nhập số điện thoại"
                            />

                            <FormInput
                                label="Địa chỉ giao hàng"
                                type="text"
                                register={register("address", { required: "Vui lòng nhập địa chỉ" })}
                                error={errors.address}
                                placeholder="Nhập địa chỉ giao hàng"
                            />

                            <FormInput
                                label="Họ tên"
                                type="text"
                                register={register("name")}
                                error={errors.name}
                                placeholder="Nhập họ tên (không bắt buộc)"
                            />

                            <FormInput
                                label="Ghi chú"
                                type="text"
                                register={register("message")}
                                error={errors.message}
                                placeholder="Ghi chú thêm..."
                            />
                        </form>
                    </div>

                    {/* RIGHT SIDE - Order Details */}
                    <div className="w-1/2 overflow-y-auto p-5 bg-gray-50">
                        <h3 className="text-base font-semibold text-gray-800 mb-4">Chi tiết đơn hàng</h3>
                        <div className="bg-white rounded-xl p-4 space-y-3">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm border-b border-gray-100 pb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-gray-800">{item.name}</span>
                                            {item.size && (
                                                <span className="text-xs text-gray-500">({item.size})</span>
                                            )}
                                            <span className="text-xs text-gray-500">x{item.quantity}</span>
                                        </div>
                                        {item.toppings && item.toppings.length > 0 && (
                                            <div className="text-xs text-gray-500 mt-1">
                                                {item.toppings.map((t: any) => `${t.name} x${t.quantity}`).join(", ")}
                                            </div>
                                        )}
                                        {item.note && (
                                            <div className="text-xs text-gray-400 mt-1 italic">
                                                {item.note}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-medium text-primary">
                                        {item.total_price?.toLocaleString()}đ
                                    </span>
                                </div>
                            ))}

                            <div className="pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800">Tổng cộng</span>
                                    <span className="text-xl font-bold text-primary">
                                        {total.toLocaleString()}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 bg-white">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting || !watchedPhone || !watchedAddress}
                            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-4 h-4" />
                                    Xác nhận đơn hàng
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;