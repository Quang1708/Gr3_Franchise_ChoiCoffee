export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";
export type PaymentStatus = "Unpaid" | "Paid" | "Refunded";

export type OrderItem = {
	id: string;
	name: string;
	quantity: number;
	price: number;
};

export type OrderData = {
	id: string;
	customer_name: string;
	customer_email: string;
	customer_phone: string;
	created_at: string;
	status: OrderStatus;
	payment_method: "Cash" | "Card" | "Momo" | "ZaloPay";
	payment_status: PaymentStatus;
	shipping_address: string;
	note?: string;
	items: OrderItem[];
};

export const FAKE_ORDERS: OrderData[] = [
	{
		id: "ORD-240201-001",
		customer_name: "Nguyen Minh Anh",
		customer_email: "minhanh@gmail.com",
		customer_phone: "0901 234 567",
		created_at: "2026-02-01T09:12:00Z",
		status: "Pending",
		payment_method: "Momo",
		payment_status: "Unpaid",
		shipping_address: "12 Nguyen Hue, Q.1, TP.HCM",
		note: "Giao trước 10h",
		items: [
			{ id: "CF-01", name: "Latte Hot", quantity: 2, price: 42000 },
			{ id: "CF-12", name: "Croissant", quantity: 1, price: 35000 },
		],
	},
	{
		id: "ORD-240201-002",
		customer_name: "Tran Quang Huy",
		customer_email: "quanghuy@gmail.com",
		customer_phone: "0938 888 222",
		created_at: "2026-02-01T10:05:00Z",
		status: "Processing",
		payment_method: "Card",
		payment_status: "Paid",
		shipping_address: "88 Dien Bien Phu, Q.3, TP.HCM",
		items: [
			{ id: "CF-08", name: "Cold Brew", quantity: 1, price: 55000 },
			{ id: "CF-05", name: "Mocha", quantity: 1, price: 48000 },
		],
	},
	{
		id: "ORD-240201-003",
		customer_name: "Le Thu Ha",
		customer_email: "thuha@gmail.com",
		customer_phone: "0912 777 111",
		created_at: "2026-02-01T11:20:00Z",
		status: "Completed",
		payment_method: "Cash",
		payment_status: "Paid",
		shipping_address: "45 Tran Hung Dao, Q.1, TP.HCM",
		items: [
			{ id: "CF-02", name: "Cappuccino", quantity: 2, price: 45000 },
			{ id: "CF-14", name: "Cheese Cake", quantity: 1, price: 52000 },
		],
	},
	{
		id: "ORD-240201-004",
		customer_name: "Pham Khanh Linh",
		customer_email: "khanhlinh@gmail.com",
		customer_phone: "0987 222 333",
		created_at: "2026-02-01T13:40:00Z",
		status: "Cancelled",
		payment_method: "ZaloPay",
		payment_status: "Refunded",
		shipping_address: "122 Phan Xich Long, Phu Nhuan, TP.HCM",
		note: "Khach yeu cau huy",
		items: [{ id: "CF-06", name: "Americano", quantity: 3, price: 38000 }],
	},
	{
		id: "ORD-240202-005",
		customer_name: "Vo Thanh Nam",
		customer_email: "thanhnam@gmail.com",
		customer_phone: "0903 555 444",
		created_at: "2026-02-02T08:15:00Z",
		status: "Processing",
		payment_method: "Momo",
		payment_status: "Paid",
		shipping_address: "15 Le Loi, Q.1, TP.HCM",
		items: [
			{ id: "CF-10", name: "Matcha Latte", quantity: 1, price: 52000 },
			{ id: "CF-13", name: "Brownie", quantity: 2, price: 32000 },
		],
	},
	{
		id: "ORD-240202-006",
		customer_name: "Dang My Linh",
		customer_email: "mylinh@gmail.com",
		customer_phone: "0971 666 555",
		created_at: "2026-02-02T09:45:00Z",
		status: "Pending",
		payment_method: "Cash",
		payment_status: "Unpaid",
		shipping_address: "96 Vo Van Tan, Q.3, TP.HCM",
		note: "Khach muon nhan tai cua hang",
		items: [
			{ id: "CF-03", name: "Espresso", quantity: 2, price: 30000 },
			{ id: "CF-15", name: "Cookie", quantity: 3, price: 18000 },
		],
	},
	{
		id: "ORD-240202-007",
		customer_name: "Hoang Bao Kiet",
		customer_email: "baokiet@gmail.com",
		customer_phone: "0914 333 222",
		created_at: "2026-02-02T11:05:00Z",
		status: "Completed",
		payment_method: "Card",
		payment_status: "Paid",
		shipping_address: "201 Nguyen Van Cu, Q.5, TP.HCM",
		items: [
			{ id: "CF-07", name: "Caramel Macchiato", quantity: 1, price: 56000 },
			{ id: "CF-16", name: "Tiramisu", quantity: 1, price: 60000 },
		],
	},
	{
		id: "ORD-240202-008",
		customer_name: "Bui Thao Nhi",
		customer_email: "thaonhi@gmail.com",
		customer_phone: "0909 222 111",
		created_at: "2026-02-02T12:30:00Z",
		status: "Processing",
		payment_method: "ZaloPay",
		payment_status: "Paid",
		shipping_address: "33 Tran Nao, Thu Duc, TP.HCM",
		items: [
			{ id: "CF-09", name: "Oat Milk Latte", quantity: 2, price: 58000 },
		],
	},
	{
		id: "ORD-240202-009",
		customer_name: "Nguyen Thi Loan",
		customer_email: "thiloan@gmail.com",
		customer_phone: "0932 123 999",
		created_at: "2026-02-02T14:10:00Z",
		status: "Completed",
		payment_method: "Cash",
		payment_status: "Paid",
		shipping_address: "72 Pham Ngoc Thach, Q.3, TP.HCM",
		items: [
			{ id: "CF-04", name: "Flat White", quantity: 1, price: 45000 },
			{ id: "CF-11", name: "Bagel", quantity: 1, price: 28000 },
		],
	},
	{
		id: "ORD-240202-010",
		customer_name: "Do Minh Tri",
		customer_email: "minhtri@gmail.com",
		customer_phone: "0908 101 202",
		created_at: "2026-02-02T16:05:00Z",
		status: "Cancelled",
		payment_method: "Card",
		payment_status: "Refunded",
		shipping_address: "101 Le Van Sy, Q.3, TP.HCM",
		note: "Khach khong nhan hang",
		items: [
			{ id: "CF-17", name: "Affogato", quantity: 1, price: 65000 },
		],
	},
];
