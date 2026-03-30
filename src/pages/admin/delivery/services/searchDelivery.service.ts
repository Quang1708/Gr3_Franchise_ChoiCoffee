import { axiosAdminClient } from "@/api";

export type DeliverySearchPayload = {
  franchise_id: string;
  staff_id: string;
  customer_id: string;
  status: string;
};

export type DeliveryOrderItem = {
  _id: string;
  order_id: string;
  code: string;
  status: string;
  customer_name: string;
  phone: string;
  created_at: string;
  assigned_to: string;
  assigned_to_name: string;
};

const toText = (value: unknown): string => {
  if (value == null) return "";
  return String(value);
};

const toArray = (raw: unknown): Record<string, unknown>[] => {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];

  const root = raw as
    | {
        data?:
          | Record<string, unknown>[]
          | {
              items?: Record<string, unknown>[];
              data?: Record<string, unknown>[];
            };
      }
    | undefined;

  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.data?.items)) return root.data.items;
  if (Array.isArray(root?.data?.data)) return root.data.data;
  return [];
};

const mapDeliveryOrderItem = (
  item: Record<string, unknown>,
): DeliveryOrderItem => {
  const order = (item.order as Record<string, unknown> | undefined) ?? item;

  return {
    _id: toText(item._id ?? item.id ?? order._id ?? order.id),
    order_id: toText(item.order_id ?? order.order_id ?? order._id ?? order.id),
    code: toText(order.code ?? item.order_code),
    status: toText(item.status ?? order.status).toUpperCase(),
    customer_name: toText(order.customer_name ?? item.customer_name),
    phone: toText(
      order.phone ?? item.phone ?? item.order_phone ?? item.customer_phone,
    ),
    created_at: toText(order.created_at ?? item.created_at),
    assigned_to: toText(
      item.assigned_to ?? order.assigned_to ?? order.staff_id,
    ),
    assigned_to_name: toText(item.assigned_to_name ?? order.assigned_to_name),
  };
};

export const searchDeliveries = async (
  payload: DeliverySearchPayload,
): Promise<DeliveryOrderItem[]> => {
  const response = await axiosAdminClient.post(
    "/api/deliveries/search",
    payload,
  );
  const items = toArray(response.data);
  return items.map(mapDeliveryOrderItem).filter((item) => Boolean(item._id));
};
