import { axiosAdminClient } from "@/api";
import type { DeliveryOrderItem } from "./searchDelivery.service";

export const getDeliveryByOrderId = async (orderId: string): Promise<DeliveryOrderItem | null> => {
    try {
        const res = await axiosAdminClient.get(
            `/api/deliveries/order/${orderId}`
        );
        if(res.data){
            return res.data
        }else{
            return null
        }
    } catch (err) {
        console.error("Error fetching delivery order:", err);
        return null;
    }
};