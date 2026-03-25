import { useCallback, useEffect, useMemo, useState } from "react";
import { useCustomerAuthStore } from "@/stores/customerAuth.store";
import type { OrderListRow, OrderTab } from "../models";
import {
	buildOrderStatsUsecase,
	filterOrdersByDateUsecase,
	searchOrderByCodeUsecase,
	searchOrdersUsecase,
} from "../usecases";

const ITEMS_PER_PAGE = 3;

export const useUserOrder = () => {
	const { customerId } = useCustomerAuthStore();

	const [activeTab, setActiveTab] = useState<OrderTab>("all");
	const [appliedTab, setAppliedTab] = useState<OrderTab>("all");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [appliedFromDate, setAppliedFromDate] = useState("");
	const [appliedToDate, setAppliedToDate] = useState("");
	const [orderCode, setOrderCode] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [orders, setOrders] = useState<OrderListRow[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [canSearchByCode, setCanSearchByCode] = useState(true);
	const [reloadTick, setReloadTick] = useState(0);

	const loadOrders = useCallback(async (tab: OrderTab) => {
		if (!customerId) {
			setOrders([]);
			return;
		}

		try {
			setIsLoading(true);
			setErrorMessage("");
			const rows = await searchOrdersUsecase(customerId, tab);
			setOrders(rows);
			setCurrentPage(1);
		} catch (error) {
			console.error("Khong the tai danh sach don hang:", error);
			setErrorMessage("Khong the tai danh sach don hang. Vui long thu lai.");
			setOrders([]);
		} finally {
			setIsLoading(false);
		}
	}, [customerId]);

	useEffect(() => {
		void loadOrders(appliedTab);
	}, [appliedTab, customerId, loadOrders, reloadTick]);

	useEffect(() => {
		if (
			activeTab !== appliedTab ||
			fromDate !== appliedFromDate ||
			toDate !== appliedToDate
		) {
			setCanSearchByCode(false);
		}
	}, [activeTab, appliedFromDate, appliedTab, fromDate, toDate, appliedToDate]);

	const searchByOrderCode = useCallback(async () => {
		if (!canSearchByCode) {
			setErrorMessage("Vui long bam 'Loc ket qua' truoc khi tim ma don hang.");
			return;
		}

		if (!customerId) {
			setOrders([]);
			return;
		}

		const code = orderCode.trim();
		if (!code) {
			await loadOrders(appliedTab);
			return;
		}

		try {
			setIsLoading(true);
			setErrorMessage("");
			const rows = await searchOrderByCodeUsecase(customerId, code, appliedTab);
			setOrders(rows);
			setCurrentPage(1);
			if (rows.length === 0) {
				setErrorMessage("Không tìm thấy đơn hàng với mã bạn nhập.");
			}
		} catch (error) {
			console.error("Lỗi khi tìm đơn hàng theo mã:", error);
			setErrorMessage("Không thể tìm đơn hàng theo mã. Vui lòng thử lại.");
			setOrders([]);
		} finally {
			setIsLoading(false);
		}
	}, [appliedTab, canSearchByCode, customerId, loadOrders, orderCode]);

	const applyFilters = useCallback(async () => {
		setAppliedTab(activeTab);
		setAppliedFromDate(fromDate);
		setAppliedToDate(toDate);
		setCanSearchByCode(true);
		setReloadTick((prev) => prev + 1);
	}, [activeTab, fromDate, toDate]);

	const handleTabChange = useCallback(async (tab: OrderTab) => {
		setActiveTab(tab);
		setAppliedTab(tab);
		setCurrentPage(1);
		setCanSearchByCode(true);
	}, []);

	const filteredOrders = useMemo(
		() => filterOrdersByDateUsecase(orders, appliedFromDate, appliedToDate),
		[orders, appliedFromDate, appliedToDate],
	);

	const stats = useMemo(() => buildOrderStatsUsecase(orders), [orders]);

	const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	return {
		activeTab,
		handleTabChange,
		fromDate,
		setFromDate,
		toDate,
		setToDate,
		orderCode,
		setOrderCode,
		currentPage,
		setCurrentPage,
		itemsPerPage: ITEMS_PER_PAGE,
		filteredOrders,
		paginatedOrders,
		totalPages,
		startIndex,
		stats,
		isLoading,
		errorMessage,
		canSearchByCode,
		refreshOrders: applyFilters,
		searchByOrderCode,
	};
};

