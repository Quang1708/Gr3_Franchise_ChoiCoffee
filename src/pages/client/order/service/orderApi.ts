import { axiosClient } from "@/api";
import type { ApiOrder, ApiOrderStatus } from "../models";

type OrdersByCustomerResponse = {
	success?: boolean;
	data?: ApiOrder[] | ApiOrder | null;
};

type OrderDetailResponse = {
	success?: boolean;
	data?: ApiOrder | null;
};

type OrderByCodeResponse = {
	success?: boolean;
	data?: ApiOrder | null;
};

export const getOrdersByCustomerId = async (
	customerId: string,
	status?: ApiOrderStatus,
): Promise<ApiOrder[]> => {
	if (!customerId.trim()) return [];

	const response = await axiosClient.get<OrdersByCustomerResponse>(
		`/api/orders/customer/${customerId}`,
		{
			params: {
				status: status || undefined,
			},
		},
	);

	const rawData = response.data?.data;
	if (!rawData) return [];
	return Array.isArray(rawData) ? rawData : [rawData];
};

export const getOrderById = async (orderId: string): Promise<ApiOrder | null> => {
	if (!orderId.trim()) return null;

	try {
		const response = await axiosClient.get<OrderDetailResponse>(`/api/orders/${orderId}`);
		const rawData = response.data?.data;
		if (!rawData || Array.isArray(rawData)) return null;
		return rawData;
	} catch (error) {
		const status = (error as { response?: { status?: number } })?.response?.status;
		if (status === 400 || status === 404) {
			return null;
		}
		throw error;
	}
};

export const getOrderByCode = async (code: string): Promise<ApiOrder | null> => {
	const normalizedCode = code.trim();
	if (!normalizedCode) return null;

	try {
		const response = await axiosClient.get<OrderByCodeResponse>("/api/orders/code", {
			params: {
				code: normalizedCode,
			},
		});
		const rawData = response.data?.data;
		if (!rawData || Array.isArray(rawData)) return null;
		return rawData;
	} catch (error) {
		const status = (error as { response?: { status?: number } })?.response?.status;
		if (status === 400 || status === 404) {
			return null;
		}
		throw error;
	}
};

