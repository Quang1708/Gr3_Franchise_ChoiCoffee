import React, { useEffect, useState, type ReactElement } from "react";
import { CRUDModalTemplate } from "../Admin/template/CRUDModal.template";
import { toast } from "react-toastify";
import { 
  CheckCircle2, 
  ClipboardCheck, 
  ChefHat, 
  PackageCheck, 
  Truck, 
  CheckSquare, 
  Ban 
} from "lucide-react";
import type { Order } from "@/pages/admin/order/models/searchOrderResponse.model";
import { completeStatus, pickupStatus, prepareStatus, readyPickupStatus } from "./services/changeStatsus.service";
import { getDeliveryByOrderId } from "./services/delivery.service";
import { useAdminContextStore } from "@/stores";
import type { StaffUser } from "./models/staff.model";
import { getStaffByFranchiseId } from "./services/getStaff.service";

export type OrderStatusFormProps = {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSuccess: () => void;
};


// const user = useAdminContextStore((state) => );
const STATUS_OPTIONS = [
  { 
    value: "CONFIRMED", 
    label: "Đã xác nhận", 
    icon: <ClipboardCheck className="w-5 h-5" />, 
    colorClass: "text-blue-600 bg-blue-50 border-blue-200 ring-blue-500",
    hoverClass: "hover:bg-blue-50 hover:border-blue-300"
  },
  { 
    value: "PREPARING", 
    label: "Đang chuẩn bị", 
    icon: <ChefHat className="w-5 h-5" />, 
    colorClass: "text-orange-600 bg-orange-50 border-orange-200 ring-orange-500",
    hoverClass: "hover:bg-orange-50 hover:border-orange-300"
  },
  { 
    value: "READY_FOR_PICKUP", 
    label: "Sẵn sàng giao", 
    icon: <PackageCheck className="w-5 h-5" />, 
    colorClass: "text-teal-600 bg-teal-50 border-teal-200 ring-teal-500",
    hoverClass: "hover:bg-teal-50 hover:border-teal-300"
  },
  { 
    value: "OUT_FOR_DELIVERY", 
    label: "Đang giao", 
    icon: <Truck className="w-5 h-5" />, 
    colorClass: "text-purple-600 bg-purple-50 border-purple-200 ring-purple-500",
    hoverClass: "hover:bg-purple-50 hover:border-purple-300"
  },
  { 
    value: "COMPLETED", 
    label: "Hoàn tất", 
    icon: <CheckSquare className="w-5 h-5" />, 
    colorClass: "text-green-600 bg-green-50 border-green-200 ring-green-500",
    hoverClass: "hover:bg-green-50 hover:border-green-300"
  },
  { 
    value: "CANCELED", 
    label: "Hủy đơn", 
    icon: <Ban className="w-5 h-5" />, 
    colorClass: "text-red-600 bg-red-50 border-red-200 ring-red-500",
    hoverClass: "hover:bg-red-50 hover:border-red-300"
  },
];

const PROGRESS_STEPS = STATUS_OPTIONS.filter(s => s.value !== "CANCELED");

const OrderStatusForm = ({ isOpen, onClose, order, onSuccess }: OrderStatusFormProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const franchiseId = useAdminContextStore((s) => s.selectedFranchiseId);
  const [staffs, setStaffs] = useState<StaffUser[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  useEffect(() => {
    if (order && isOpen) {
      setSelectedStatus(order.status);
    }
  }, [order, isOpen]);
  

  useEffect(() => {
  if (isOpen && franchiseId) {
    const fetchStaffInfo = async () => {
      const staffRoleId = "69a1aa8be6a85d288f9b4a28";
      try {
        const res = await getStaffByFranchiseId({
          searchCondition: {
            user_id: "",
            franchise_id: franchiseId,
            role_id: staffRoleId,
            is_deleted: false,
          },
          pageInfo: {
            pageNum: 1,
            pageSize: 50,
          },
        });

        setStaffs(res.data || []);
      } catch (error) {
        console.error("Lỗi khi lấy staff:", error);
      }
    };

    fetchStaffInfo();
  }
}, [isOpen, franchiseId]);

  const handleSave = async () => {
    if (!order || !selectedStatus) return;
    
    if (selectedStatus === order.status) {
      onClose();
      return;
    }


    const toastId = toast.loading("Đang cập nhật trạng thái...");
    setIsLoading(true);
    if (selectedStatus === "OUT_FOR_DELIVERY" && !selectedStaffId) {
      toast.error("Vui lòng chọn nhân viên giao hàng!");
      return;
    }
    
    try {
      switch (selectedStatus) {
        case "PREPARING":
          await prepareStatus(order._id);
          break;
        case "READY_FOR_PICKUP":
          await readyPickupStatus(order._id, selectedStaffId);
          break;
          
        case "OUT_FOR_DELIVERY": {
          
          const deliveryInfo = await getDeliveryByOrderId(order._id);
          console.log(deliveryInfo.data);
         
          const deliveryId = deliveryInfo?.data?._id; 
          
          if (!deliveryId) throw new Error("Không tìm thấy mã giao hàng (deliveryId)!");
          
          
          await pickupStatus(deliveryId);
          break;
        }
          
        case "COMPLETED": {
          const deliveryInfo = await getDeliveryByOrderId(order._id);      
          const deliveryId = deliveryInfo?.data?._id || deliveryInfo?._id || deliveryInfo?.id;      
          if (!deliveryId) throw new Error("Không tìm thấy mã giao hàng (deliveryId)!");
          await completeStatus(deliveryId);
          break;
        }

        default:
          throw new Error("Trạng thái này hiện chưa có API hỗ trợ!");
      }

      toast.update(toastId, {
        render: "Cập nhật trạng thái thành công!",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      
      onSuccess(); 
      onClose();   
    } catch (error: any) {
      console.error("Lỗi cập nhật trạng thái:", error);
      toast.update(toastId, {
        render: error.message || "Có lỗi xảy ra khi cập nhật trạng thái",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  
  const currentIndex = PROGRESS_STEPS.findIndex(s => s.value === selectedStatus);
  const isCanceled = selectedStatus === "CANCELED";
  const maxIndex = PROGRESS_STEPS.length - 1;
  const progressPercentage = isCanceled ? 100 : (Math.max(currentIndex, 0) / maxIndex) * 100;

  return (
    <CRUDModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      onSave={handleSave}
      title={`trạng thái đơn ${order?.code || ""}`}
      mode="edit"
      isLoading={isLoading}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        {/* Box thông tin */}
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
              Khách hàng
            </p>
            <p className="text-sm font-bold text-gray-800">
              {order?.customer_name || "Khách vãng lai"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">
              Tổng tiền
            </p>
            <p className="text-sm font-bold text-primary">
              {(order?.final_amount ?? 0).toLocaleString()}đ
            </p>
          </div>
        </div>

        <div className="relative mt-6 mb-12 px-2 flex justify-between items-center w-full">
          <div className="absolute left-6 right-6 top-4 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>

          <div
            className={`absolute left-6 top-4 h-1 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-in-out ${isCanceled ? "bg-red-400" : "bg-primary"}`}
            style={{
              width: `calc((100% - 48px) * ${progressPercentage / 100})`,
            }}
          ></div>

          {PROGRESS_STEPS.map((step, index) => {
            const isActive = index <= currentIndex && !isCanceled; 
            const isPast = index < currentIndex && !isCanceled; 

            return (
              <div
                key={step.value}
                className="relative z-10 flex flex-col items-center"
              >
                {/* Vòng tròn Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500
                    ${
                      isPast
                        ? "bg-primary border-primary text-white" 
                        : isActive
                          ? "bg-white border-primary text-primary shadow-sm" 
                          : "bg-white border-gray-200 text-gray-300" 
                    }
                  `}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-5 h-5 animate-in zoom-in" />
                  ) : (
                    React.cloneElement(step.icon as React.ReactElement, {
                      className: "w-4 h-4",
                    })
                  )}
                </div>

                {/* Chữ mô tả bên dưới */}
                <span
                  className={`absolute top-10 text-[10px] font-bold uppercase tracking-wider text-center w-24 transition-colors duration-300
                    ${isActive ? "text-primary" : isCanceled ? "text-red-400" : "text-gray-400"}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        {/* --- KẾT THÚC THANH TIẾN TRÌNH --- */}
        {selectedStatus === "READY_FOR_PICKUP" && (
          <div className="mt-4">
            <p className="text-sm font-bold text-gray-700 mb-2">
              Chọn nhân viên giao hàng:
            </p>

            <select
              title="Chọn nhân viên giao hàng"
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">-- Chọn nhân viên --</option>
              {staffs.map((s) => (
                <option key={s.user_id} value={s.user_id}>
                  {s.user_name} ({s.user_email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-2">
          <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
            Cập nhật trạng thái:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STATUS_OPTIONS.map((status) => {
              const isSelected = selectedStatus === status.value;
              const isCurrentStatus = order?.status === status.value;

              return (
                <label
                  key={status.value}
                  className={`
                    relative flex flex-col items-center justify-center gap-2 p-4 border rounded-xl cursor-pointer transition-all duration-200
                    ${
                      isSelected
                        ? `ring-2 border-transparent shadow-sm ${status.colorClass}`
                        : `border-gray-200 bg-white ${status.hoverClass} text-gray-500`
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="orderStatus"
                    value={status.value}
                    checked={isSelected}
                    onChange={() => setSelectedStatus(status.value)}
                    className="hidden"
                  />

                  <div
                    className={`transition-transform duration-200 ${isSelected ? "scale-110" : "scale-100"}`}
                  >
                    {status.icon}
                  </div>

                  <span className="text-xs font-bold text-center">
                    {status.label}
                  </span>

                  {isSelected && (
                    <div className="absolute top-2 right-2 animate-in zoom-in duration-200">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}

                  {isCurrentStatus && !isSelected && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-600 text-white text-[9px] font-bold rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
                      Hiện tại
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </CRUDModalTemplate>
  );
};

export default OrderStatusForm;