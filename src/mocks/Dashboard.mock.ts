// Mock data for Admin Dashboard

export interface RevenueData {
  month: string;
  value2024: number;
  value2023: number;
  value2022: number;
}

export interface CustomerData {
  date: string;
  value: number;
}

export interface SalesData {
  category: string;
  value: number;
  color: string;
}

export interface ProductRevenue {
  id: string;
  name: string;
  assigned: string;
  assignedAvatar: string;
  progress: number;
  priority: "Low" | "Medium" | "High" | "Very High";
  budget: string;
}

export interface InventoryAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  status: "critical" | "low" | "warning";
  category: string;
}

export interface OrderStatus {
  status: string;
  count: number;
  icon: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalFranchises: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  franchisesChange: number;
}

// Revenue Forecast Data (Last 8 months)
export const revenueForecastData: RevenueData[] = [
  { month: "Jan", value2024: 90, value2023: 60, value2022: 35 },
  { month: "Feb", value2024: 75, value2023: 65, value2022: 40 },
  { month: "Mar", value2024: 85, value2023: 70, value2022: 45 },
  { month: "Apr", value2024: 60, value2023: 75, value2022: 50 },
  { month: "May", value2024: 70, value2023: 80, value2022: 45 },
  { month: "Jun", value2024: 80, value2023: 85, value2022: 55 },
  { month: "Jul", value2024: 65, value2023: 90, value2022: 50 },
  { month: "Aug", value2024: 30, value2023: 105, value2022: 60 },
];

// Customer Data (Last 7 days)
export const customerData: CustomerData[] = [
  { date: "Apr 07", value: 4200 },
  { date: "Apr 08", value: 4800 },
  { date: "Apr 09", value: 5200 },
  { date: "Apr 10", value: 4500 },
  { date: "Apr 11", value: 5800 },
  { date: "Apr 12", value: 6200 },
  { date: "Apr 13", value: 6380 },
];

// Sales Overview Data
export const salesOverviewData: SalesData[] = [
  { category: "Coffee", value: 45, color: "#8B5CF6" },
  { category: "Beverages", value: 30, color: "#EC4899" },
  { category: "Food", value: 20, color: "#14B8A6" },
  { category: "Others", value: 5, color: "#94A3B8" },
];

// Revenue by Product
export const productRevenueData: ProductRevenue[] = [
  {
    id: "1",
    name: "Espresso Classic",
    assigned: "Jason Roy",
    assignedAvatar: "https://i.pravatar.cc/150?img=12",
    progress: 73.2,
    priority: "Medium",
    budget: "$3.5K",
  },
  {
    id: "2",
    name: "Cappuccino Deluxe",
    assigned: "Mathew Flintoff",
    assignedAvatar: "https://i.pravatar.cc/150?img=13",
    progress: 73.2,
    priority: "Very High",
    budget: "$24.5K",
  },
  {
    id: "3",
    name: "Latte Art Collection",
    assigned: "Anil Kumar",
    assignedAvatar: "https://i.pravatar.cc/150?img=14",
    progress: 73.2,
    priority: "Low",
    budget: "$12.8K",
  },
  {
    id: "4",
    name: "Cold Brew Series",
    assigned: "George Cruize",
    assignedAvatar: "https://i.pravatar.cc/150?img=15",
    progress: 73.2,
    priority: "High",
    budget: "$2.4K",
  },
];

// Inventory Alerts
export const inventoryAlerts: InventoryAlert[] = [
  {
    id: "1",
    productName: "Arabica Coffee Beans",
    currentStock: 15,
    minStock: 50,
    status: "critical",
    category: "Coffee Beans",
  },
  {
    id: "2",
    productName: "Milk (Full Cream)",
    currentStock: 25,
    minStock: 100,
    status: "critical",
    category: "Dairy",
  },
  {
    id: "3",
    productName: "Sugar (White)",
    currentStock: 45,
    minStock: 80,
    status: "low",
    category: "Condiments",
  },
  {
    id: "4",
    productName: "Paper Cups (12oz)",
    currentStock: 120,
    minStock: 200,
    status: "warning",
    category: "Packaging",
  },
  {
    id: "5",
    productName: "Vanilla Syrup",
    currentStock: 8,
    minStock: 30,
    status: "critical",
    category: "Syrups",
  },
];

// Order Status Data
export const orderStatusData: OrderStatus[] = [
  { status: "Processing", count: 64, icon: "building" },
  { status: "On hold", count: 4, icon: "heart" },
  { status: "Delivered", count: 6, icon: "package" },
];

// Total Settlements Data (Weeks)
export const settlementsData = [
  { week: "1W", value: 8500 },
  { week: "3W", value: 9200 },
  { week: "5W", value: 7800 },
  { week: "7W", value: 10500 },
  { week: "9W", value: 9800 },
  { week: "11W", value: 11200 },
  { week: "13W", value: 10800 },
  { week: "15W", value: 12200 },
];

// Dashboard Statistics
export const dashboardStats: DashboardStats = {
  totalRevenue: 98450,
  totalOrders: 78298,
  totalCustomers: 36358,
  totalFranchises: 45,
  revenueChange: 12.5,
  ordersChange: 31.8,
  customersChange: -12,
  franchisesChange: 5.2,
};

// Budget and Expense
export const budgetData = {
  budget: 98450,
  expense: 2440,
  remaining: 96010,
};
