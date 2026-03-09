import { useEffect, useMemo, useState } from "react";
import { CRUDTable, type Column } from "../../../components/Admin/template/CRUD.template";
import {
  getCustomerLoyalties,
  getLoyaltyTransactions,
  getTransactionsByCustomerFranchise,
} from "../../../services/loyalty.service";
import type { CustomerFranchise } from "../../../models/customer_franchise.model";
import type { LoyaltyTransaction } from "../../../models/loyalty_transaction.model";
import { CUSTOMER_SEED_DATA } from "../../../mocks/customer.seed";
import { FRANCHISE_SEED_DATA } from "../../../mocks/franchise.seed";
import { USER_SEED_DATA } from "../../../mocks/user.seed";
import { ORDER_SEED_DATA } from "../../../mocks/order.seed";

type LoyaltyTier = CustomerFranchise["loyaltyTier"];
type TransactionType = LoyaltyTransaction["type"];

const tierLabel: Record<LoyaltyTier, string> = {
  Silver: "Bạc",
  Gold: "Vàng",
  Platinum: "Bạch kim",
};

const tierColor: Record<LoyaltyTier, string> = {
  Silver: "bg-gray-100 text-gray-800",
  Gold: "bg-amber-100 text-amber-800",
  Platinum: "bg-slate-200 text-slate-800",
};

const typeLabel: Record<TransactionType, string> = {
  EARN: "Tích điểm",
  REDEEM: "Đổi điểm",
  ADJUST: "Điều chỉnh",
};

const typeColor: Record<TransactionType, string> = {
  EARN: "bg-green-100 text-green-800",
  REDEEM: "bg-amber-100 text-amber-800",
  ADJUST: "bg-blue-100 text-blue-800",
};

const formatDateTime = (value?: string) => {
  if (!value) return "--";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};

type CustomerLoyaltyRow = CustomerFranchise & {
  customerName: string;
  franchiseName: string;
};

type TransactionRow = LoyaltyTransaction & {
  customerName: string;
  franchiseName: string;
  orderCode: string;
  createdByName: string;
};

const LoyaltyPage = () => {
  const [activeTab, setActiveTab] = useState<"customers" | "transactions">(
    "customers"
  );

  const [customerLoyalties, setCustomerLoyalties] = useState<
    CustomerFranchise[]
  >([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerLoyaltyRow | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<
    LoyaltyTransaction[]
  >([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const [cust, txn] = await Promise.all([
          getCustomerLoyalties(),
          getLoyaltyTransactions(),
        ]);
        if (!mounted) return;
        setCustomerLoyalties(cust);
        setTransactions(txn);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const customerNameById = useMemo(
    () => new Map(CUSTOMER_SEED_DATA.map((c) => [c.id, c.name])),
    []
  );
  const franchiseNameById = useMemo(
    () => new Map(FRANCHISE_SEED_DATA.map((f) => [f.id, f.name])),
    []
  );
  const userNameById = useMemo(
    () => new Map(USER_SEED_DATA.map((u) => [u.id, u.name])),
    []
  );
  const orderCodeById = useMemo(
    () => new Map(ORDER_SEED_DATA.map((o) => [o.id, o.code])),
    []
  );

  const customerFranchiseById = useMemo(
    () => new Map(customerLoyalties.map((cf) => [cf.id, cf])),
    [customerLoyalties]
  );

  const customerRows = useMemo<CustomerLoyaltyRow[]>(() => {
    return customerLoyalties.map((cf) => ({
      ...cf,
      customerName:
        customerNameById.get(cf.customerId) ?? `#${cf.customerId}`,
      franchiseName:
        franchiseNameById.get(String(cf.franchiseId)) ?? `#${cf.franchiseId}`,
    }));
  }, [customerLoyalties, customerNameById, franchiseNameById]);

  const transactionRows = useMemo<TransactionRow[]>(() => {
    return transactions.map((t) => {
      const cf = customerFranchiseById.get(t.customerFranchiseId);
      const customerId = cf?.customerId;
      const franchiseId = cf?.franchiseId;
      return {
        ...t,
        customerName: customerId
          ? customerNameById.get(customerId) ?? `#${customerId}`
          : "--",
        franchiseName: franchiseId
          ? franchiseNameById.get(String(franchiseId)) ?? `#${franchiseId}`
          : "--",
        orderCode: t.orderId
          ? orderCodeById.get(t.orderId) ?? `#${t.orderId}`
          : "--",
        createdByName: t.createdBy
          ? userNameById.get(t.createdBy) ?? `User #${t.createdBy}`
          : "Hệ thống",
      };
    });
  }, [
    transactions,
    customerFranchiseById,
    customerNameById,
    franchiseNameById,
    orderCodeById,
    userNameById,
  ]);

  const handleViewCustomer = async (item: CustomerLoyaltyRow) => {
    setSelectedCustomer(item);
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const list = await getTransactionsByCustomerFranchise(item.id);
      setCustomerTransactions(list);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const customerColumns: Column<CustomerLoyaltyRow>[] = useMemo(
    () => [
      {
        header: "Khách hàng",
        accessor: "customerName",
        className: "min-w-[180px]",
        sortable: true,
      },
      {
        header: "Chi nhánh",
        accessor: "franchiseName",
        className: "min-w-[200px]",
        sortable: true,
      },
      {
        header: "Điểm tích lũy",
        accessor: "loyaltyPoint",
        sortable: true,
        render: (it) => (
          <span className="font-semibold text-primary">
            {it.loyaltyPoint.toLocaleString("vi-VN")} điểm
          </span>
        ),
      },
      {
        header: "Hạng",
        accessor: "loyaltyTier",
        sortable: true,
        render: (it) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tierColor[it.loyaltyTier]}`}
          >
            {tierLabel[it.loyaltyTier]}
          </span>
        ),
      },
      {
        header: "Đơn cuối",
        accessor: (it) => formatDateTime(it.lastOrderAt),
        sortable: true,
      },
    ],
    []
  );

  const transactionColumns: Column<TransactionRow>[] = useMemo(
    () => [
      {
        header: "ID",
        accessor: "id",
        className: "min-w-[60px]",
      },
      {
        header: "Khách hàng",
        accessor: "customerName",
        className: "min-w-[160px]",
        sortable: true,
      },
      {
        header: "Chi nhánh",
        accessor: "franchiseName",
        className: "min-w-[180px]",
        sortable: true,
      },
      {
        header: "Loại",
        accessor: "type",
        sortable: true,
        render: (it) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${typeColor[it.type]}`}
          >
            {typeLabel[it.type]}
          </span>
        ),
      },
      {
        header: "Điểm",
        accessor: "pointChange",
        sortable: true,
        render: (it) => (
          <span
            className={
              it.pointChange >= 0
                ? "font-medium text-green-600"
                : "font-medium text-red-600"
            }
          >
            {it.pointChange >= 0 ? `+${it.pointChange}` : it.pointChange} điểm
          </span>
        ),
      },
      {
        header: "Lý do",
        accessor: "reason",
        className: "max-w-[200px] truncate",
      },
      {
        header: "Ngày tạo",
        accessor: (it) => formatDateTime(it.createdAt),
        sortable: true,
      },
      {
        header: "Người thực hiện",
        accessor: "createdByName",
        sortable: true,
      },
    ],
    []
  );

  return (
    <div className="p-6 transition-all animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Quản lý Loyalty
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "customers"
              ? "bg-white border border-b-0 border-gray-200 text-primary -mb-px"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Khách hàng Loyalty
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "transactions"
              ? "bg-white border border-b-0 border-gray-200 text-primary -mb-px"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
        >
          Giao dịch điểm
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">
          Đang tải dữ liệu...
        </div>
      ) : activeTab === "customers" ? (
        <CRUDTable<CustomerLoyaltyRow>
          title="Danh sách khách hàng loyalty"
          data={customerRows}
          columns={customerColumns}
          pageSize={10}
          hideScrollbars
          wrapCells
          onView={handleViewCustomer}
          searchKeys={["customerName", "franchiseName"]}
          filters={[
            {
              key: "loyaltyTier",
              label: "Hạng",
              options: [
                { value: "Silver", label: "Bạc" },
                { value: "Gold", label: "Vàng" },
                { value: "Platinum", label: "Bạch kim" },
              ],
            },
          ]}
        />
      ) : (
        <CRUDTable<TransactionRow>
          title="Danh sách giao dịch điểm"
          data={transactionRows}
          columns={transactionColumns}
          pageSize={10}
          hideScrollbars
          wrapCells
          searchKeys={["customerName", "reason", "createdByName"]}
          filters={[
            {
              key: "type",
              label: "Loại",
              options: [
                { value: "EARN", label: "Tích điểm" },
                { value: "REDEEM", label: "Đổi điểm" },
                { value: "ADJUST", label: "Điều chỉnh" },
              ],
            },
          ]}
        />
      )}

      {/* Modal chi tiết khách hàng loyalty */}
      {isDetailOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
          <div className="w-full max-w-4xl rounded-xl border border-gray-100 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Chi tiết Loyalty - {selectedCustomer.customerName}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedCustomer.franchiseName} • ID #{selectedCustomer.id}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedCustomer(null);
                  setCustomerTransactions([]);
                }}
              >
                Đóng
              </button>
            </div>
            <div className="max-h-[78vh] space-y-5 overflow-y-auto px-6 py-5">
              <div className="rounded-lg border border-gray-100 p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                  Thông tin loyalty
                </p>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                  <p>
                    <span className="font-medium text-gray-600">
                      Điểm tích lũy:
                    </span>{" "}
                    <span className="font-semibold text-primary">
                      {selectedCustomer.loyaltyPoint.toLocaleString("vi-VN")}{" "}
                      điểm
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Hạng:</span>{" "}
                    {tierLabel[selectedCustomer.loyaltyTier]}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      Đơn đầu tiên:
                    </span>{" "}
                    {formatDateTime(selectedCustomer.firstOrderAt)}
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">
                      Đơn gần nhất:
                    </span>{" "}
                    {formatDateTime(selectedCustomer.lastOrderAt)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-gray-100 p-4">
                <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">
                  Lịch sử giao dịch điểm
                </p>
                {isDetailLoading ? (
                  <p className="text-sm text-gray-500">Đang tải...</p>
                ) : customerTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                          <th className="px-2 py-2">ID</th>
                          <th className="px-2 py-2">Loại</th>
                          <th className="px-2 py-2">Điểm</th>
                          <th className="px-2 py-2">Lý do</th>
                          <th className="px-2 py-2">Ngày</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerTransactions.map((t) => (
                          <tr
                            key={t.id}
                            className="border-b border-gray-50 last:border-0"
                          >
                            <td className="px-2 py-2">{t.id}</td>
                            <td className="px-2 py-2">
                              <span
                                className={`inline-flex rounded px-1.5 py-0.5 text-xs ${typeColor[t.type]}`}
                              >
                                {typeLabel[t.type]}
                              </span>
                            </td>
                            <td
                              className={`px-2 py-2 font-medium ${
                                t.pointChange >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {t.pointChange >= 0
                                ? `+${t.pointChange}`
                                : t.pointChange}
                            </td>
                            <td className="px-2 py-2">{t.reason || "--"}</td>
                            <td className="px-2 py-2">
                              {formatDateTime(t.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Không có giao dịch nào.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyPage;
