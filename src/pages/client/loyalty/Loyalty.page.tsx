import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientLoading from "@/components/Client/Client.Loading";
import {
  ChevronDown,
  Crown,
  Gift,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ROUTER_URL from "../../../routes/router.const";
import { useCustomerAuthStore } from "@/stores";
import type {
  CustomerSummary,
  FranchiseLoyaltyRule,
  LoyaltyTierRule,
} from "./models/loyaltyClient.model";
import { getLoyaltyOverviewUsecase } from "./usecases/getLoyaltyOverview.usecase";

const FALLBACK_FRANCHISE_ID = "698eab0826ca2b18eb35337e";

const formatNumber = (value: number): string => value.toLocaleString("vi-VN");

const formatCurrency = (value: number): string => `${formatNumber(value)} đ`;

const getTierLabel = (tier: string): string => {
  const tierMap: Record<string, string> = {
    BRONZE: "Hạng Đồng",
    SILVER: "Hạng Bạc",
    GOLD: "Hạng Vàng",
    PLATINUM: "Hạng Bạch Kim",
    DIAMOND: "Hạng Kim Cương",
  };
  return tierMap[tier.toUpperCase()] || tier;
};

const getTierTone = (tier: string): string => {
  const toneMap: Record<string, string> = {
    BRONZE: "from-amber-500 to-orange-500",
    SILVER: "from-slate-400 to-slate-600",
    GOLD: "from-yellow-400 to-amber-500",
    PLATINUM: "from-sky-400 to-blue-500",
    DIAMOND: "from-cyan-400 to-indigo-500",
  };
  return toneMap[tier.toUpperCase()] || "from-gray-400 to-gray-600";
};

const getCurrentTierRule = (
  tierRules: LoyaltyTierRule[],
  tierName?: string,
): LoyaltyTierRule | undefined => {
  if (!tierName) return undefined;
  return tierRules.find(
    (rule) => rule.tier.toUpperCase() === tierName.toUpperCase(),
  );
};

const getNextTierRule = (
  tierRules: LoyaltyTierRule[],
  currentPoints: number,
): LoyaltyTierRule | undefined => {
  return [...tierRules]
    .sort((a, b) => a.min_points - b.min_points)
    .find((rule) => rule.min_points > currentPoints);
};

const LoyaltyPage = () => {
  const navigate = useNavigate();
  const customer = useCustomerAuthStore((state) => state.customer);
  const [franchiseId, setFranchiseId] = useState<string>(() => {
    return localStorage.getItem("selectedFranchise") || FALLBACK_FRANCHISE_ID;
  });
  const [loyaltyRule, setLoyaltyRule] = useState<FranchiseLoyaltyRule | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>(
    customer?.name || "Khách hàng",
  );
  const [customerLoyalty, setCustomerLoyalty] = useState<{
    loyalty_points: number;
    current_tier: string;
    total_earned_points: number;
    total_orders: number;
    total_spent: number;
  } | null>(null);
  const [isTierTableOpen, setIsTierTableOpen] = useState<boolean>(false);

  useEffect(() => {
    const onFranchiseChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ franchiseId?: string }>;
      const newFranchiseId = customEvent.detail?.franchiseId;
      if (typeof newFranchiseId === "string" && newFranchiseId.trim()) {
        setFranchiseId(newFranchiseId);
      }
    };

    window.addEventListener("franchiseChanged", onFranchiseChanged);
    return () => {
      window.removeEventListener("franchiseChanged", onFranchiseChanged);
    };
  }, []);

  useEffect(() => {
    setCustomerName(customer?.name || "Khách hàng");
  }, [customer?.name]);

  useEffect(() => {
    const fetchData = async () => {
      if (!franchiseId.trim()) return;

      try {
        setIsLoading(true);
        setError("");

        const overview = await getLoyaltyOverviewUsecase(franchiseId);

        setLoyaltyRule(overview.loyaltyRule);
        if (overview.customerLoyalty) {
          const profile = overview.customerLoyalty.customer_id;
          if (profile && typeof profile === "object") {
            const customerProfile = profile as CustomerSummary;
            if (customerProfile.name) {
              setCustomerName(customerProfile.name);
            }
          }
        }
        setCustomerLoyalty(
          overview.customerLoyalty
            ? {
                loyalty_points: overview.customerLoyalty.loyalty_points,
                current_tier: overview.customerLoyalty.current_tier,
                total_earned_points:
                  overview.customerLoyalty.total_earned_points,
                total_orders: overview.customerLoyalty.total_orders,
                total_spent: overview.customerLoyalty.total_spent,
              }
            : null,
        );
      } catch (err) {
        const e = err as { message?: string };
        setError(
          e?.message || "Không thể tải thông tin loyalty. Vui lòng thử lại.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [franchiseId]);

  const view = useMemo(() => {
    if (!loyaltyRule || !customerLoyalty) {
      return {
        points: 0,
        tier: "BRONZE",
        totalEarned: 0,
        totalOrders: 0,
        totalSpent: 0,
        currentTierRule: undefined as LoyaltyTierRule | undefined,
        nextTierRule: undefined as LoyaltyTierRule | undefined,
        progress: 0,
        redeemHint: "",
      };
    }

    const points = customerLoyalty.loyalty_points;
    const currentTierRule = getCurrentTierRule(
      loyaltyRule.tier_rules,
      customerLoyalty.current_tier,
    );
    const nextTierRule = getNextTierRule(loyaltyRule.tier_rules, points);

    const currentFloor = currentTierRule?.min_points ?? 0;
    const nextTarget = nextTierRule?.min_points ?? currentFloor;
    const distance = Math.max(nextTarget - currentFloor, 1);
    const progressed = Math.max(points - currentFloor, 0);
    const progress = nextTierRule
      ? Math.min((progressed / distance) * 100, 100)
      : 100;

    const redeemHint =
      points < loyaltyRule.min_redeem_points
        ? `Bạn cần thêm ${formatNumber(loyaltyRule.min_redeem_points - points)} điểm để đổi ưu đãi đầu tiên.`
        : `Bạn có thể đổi tối đa ${formatNumber(
            Math.min(points, loyaltyRule.max_redeem_points),
          )} điểm trong một đơn.`;

    return {
      points,
      tier: customerLoyalty.current_tier,
      totalEarned: customerLoyalty.total_earned_points,
      totalOrders: customerLoyalty.total_orders,
      totalSpent: customerLoyalty.total_spent,
      currentTierRule,
      nextTierRule,
      progress,
      redeemHint,
    };
  }, [loyaltyRule, customerLoyalty]);

  const tierTone = getTierTone(view.tier);

  if (isLoading) {
    return <ClientLoading/>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-red-200 p-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Không thể tải dữ liệu loyalty
          </h2>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="max-w-6xl mx-auto px-4 space-y-5">
        <section className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className={`bg-gradient-to-r ${tierTone} p-5 md:p-6 text-white`}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-xs opacity-90">ChoiCoffee Membership</p>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">
                  Điểm tích lũy của bạn
                </h1>
                <p className="text-xs mt-2 opacity-95">
                  Xin chào {customerName}, bạn đang ở {getTierLabel(view.tier)}{" "}
                  với {formatNumber(view.points)} điểm.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTierTableOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center gap-1.5 bg-white text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded text-xs font-medium"
                >
                  Bảng hạng thành viên
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isTierTableOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(ROUTER_URL.CLIENT_ROUTER.PROFILE)}
                  className="inline-flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded text-xs font-medium backdrop-blur"
                >
                  <Gift size={14} />
                  Quản lý tài khoản
                </button>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 md:p-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-600">
              <span>Tiến độ lên hạng tiếp theo</span>
              <span>{Math.round(view.progress)}%</span>
            </div>
            <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                style={{ width: `${view.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {view.nextTierRule
                ? `Cần thêm ${formatNumber(
                    Math.max(view.nextTierRule.min_points - view.points, 0),
                  )} điểm để đạt ${getTierLabel(view.nextTierRule.tier)}.`
                : "Bạn đang ở hạng cao nhất của hệ thống. Tuyệt vời!"}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <article className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Điểm hiện tại
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1.5">
              {formatNumber(view.points)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Cập nhật theo franchise đã chọn
            </p>
          </article>

          <article className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Tổng điểm đã nhận
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1.5">
              {formatNumber(view.totalEarned)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Từ {formatNumber(view.totalOrders)} đơn hàng
            </p>
          </article>

          <article className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Tổng chi tiêu
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1.5">
              {formatCurrency(view.totalSpent)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Tại franchise hiện tại
            </p>
          </article>

          <article className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Hạng hiện tại
            </p>
            <p className="text-xl font-black text-slate-900 mt-1.5">
              {getTierLabel(view.tier)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Dựa trên tổng điểm đang có
            </p>
          </article>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <article className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Rocket size={18} className="text-primary" />
              <h2 className="text-base font-bold text-slate-900">
                Quy tắc tích và đổi điểm
              </h2>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Tích điểm</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(loyaltyRule?.earn_amount_per_point || 0)} / 1
                  điểm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Giá trị đổi điểm</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(loyaltyRule?.redeem_value_per_point || 0)} /
                  điểm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Điểm đổi tối thiểu</span>
                <span className="font-semibold text-slate-900">
                  {formatNumber(loyaltyRule?.min_redeem_points || 0)} điểm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Điểm đổi tối đa / đơn</span>
                <span className="font-semibold text-slate-900">
                  {formatNumber(loyaltyRule?.max_redeem_points || 0)} điểm
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
              {view.redeemHint}
            </p>
          </article>

          <article className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-primary" />
              <h2 className="text-base font-bold text-slate-900">
                Ưu đãi hạng hiện tại
              </h2>
            </div>
            {view.currentTierRule ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Hạng</span>
                  <span className="font-semibold text-slate-900">
                    {getTierLabel(view.currentTierRule.tier)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Giảm giá đơn hàng</span>
                  <span className="font-semibold text-slate-900">
                    {view.currentTierRule.benefit.order_discount_percent}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Hệ số tích điểm</span>
                  <span className="font-semibold text-slate-900">
                    x{view.currentTierRule.benefit.earn_multiplier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Miễn phí vận chuyển</span>
                  <span className="font-semibold text-slate-900">
                    {view.currentTierRule.benefit.free_shipping
                      ? "Có"
                      : "Không"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-600">
                Chưa có dữ liệu ưu đãi cho hạng hiện tại.
              </p>
            )}
          </article>
        </section>

        {isTierTableOpen ? (
          <section className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-primary" />
              <h2 className="text-base font-bold text-slate-900">
                Bảng hạng thành viên
              </h2>
            </div>

            <div className="space-y-2.5 mt-3">
              {(loyaltyRule?.tier_rules || [])
                .slice()
                .sort((a, b) => a.min_points - b.min_points)
                .map((rule) => {
                  const isCurrent =
                    rule.tier.toUpperCase() === view.tier.toUpperCase();
                  return (
                    <article
                      key={`${rule.tier}-${rule.min_points}`}
                      className={`rounded-lg border p-3 ${
                        isCurrent
                          ? "border-primary bg-primary/5"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <Crown size={14} className="text-amber-500" />
                            {getTierLabel(rule.tier)}
                            {isCurrent ? (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-white">
                                Hiện tại
                              </span>
                            ) : null}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatNumber(rule.min_points)} -{" "}
                            {rule.max_points
                              ? formatNumber(rule.max_points)
                              : "không giới hạn"}{" "}
                            điểm
                          </p>
                        </div>
                        <div className="text-[11px] text-slate-600 grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-3">
                          <span>
                            Giảm giá:{" "}
                            <strong>
                              {rule.benefit.order_discount_percent}%
                            </strong>
                          </span>
                          <span>
                            Tích điểm:{" "}
                            <strong>x{rule.benefit.earn_multiplier}</strong>
                          </span>
                          <span>
                            Freeship:{" "}
                            <strong>
                              {rule.benefit.free_shipping ? "Có" : "Không"}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default LoyaltyPage;
