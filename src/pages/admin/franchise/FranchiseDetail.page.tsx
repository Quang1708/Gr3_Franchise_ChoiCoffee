/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Users, Package, Boxes } from "lucide-react";

import { FRANCHISE_SEED_DATA } from "../../../mocks/franchise.seed";
import { USER_SEED_DATA } from "../../../mocks/user.seed";
import { ROLE_SEED_DATA } from "../../../mocks/role.seed";
import { USER_FRANCHISE_ROLE_SEED_DATA } from "../../../mocks/user_franchise_role.seed";

import { PRODUCT_SEED_DATA } from "../../../mocks/product.seed";
import { PRODUCT_FRANCHISE_SEED_DATA } from "../../../mocks/product_franchise.seed";
import { INVENTORY_SEED_DATA } from "../../../mocks/inventory.seed";

type PillTone = "neutral" | "success" | "danger" | "info";

const pillToneClass: Record<PillTone, string> = {
  neutral: "bg-gray-50 text-gray-700 border-gray-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

const Pill = ({
  text,
  tone = "neutral",
}: {
  text: string;
  tone?: PillTone;
}) => (
  <span
    className={[
      "inline-flex items-center gap-1",
      "px-2.5 py-1 rounded-full text-xs font-medium",
      "border",
      pillToneClass[tone],
      "whitespace-nowrap",
    ].join(" ")}
  >
    {text}
  </span>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="py-2.5 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
    {children}
  </th>
);

const Td = ({
  children,
  strong,
  className = "",
}: {
  children: React.ReactNode;
  strong?: boolean;
  className?: string;
}) => (
  <td
    className={[
      "py-3 pr-4 align-middle text-sm",
      strong ? "font-medium text-gray-900" : "text-gray-700",
      "whitespace-nowrap",
      className,
    ].join(" ")}
  >
    {children}
  </td>
);

const EmptyRow = ({ colSpan, text }: { colSpan: number; text: string }) => (
  <tr>
    <td colSpan={colSpan} className="py-10 text-center text-sm text-gray-500">
      {text}
    </td>
  </tr>
);

/** Panel = 1 card có vùng table scroll riêng */
const Panel = ({
  title,
  icon,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white border border-gray-200 rounded-2xl flex flex-col min-h-0">
    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="text-gray-700">{icon}</div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <Pill text={count} />
    </div>

    {/* vùng scroll của panel */}
    <div className="p-4 overflow-auto min-h-0">{children}</div>
  </div>
);

type TabKey = "staff" | "product" | "inventory";

const TabPill = ({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "inline-flex items-center gap-2",
      "px-3 py-2 rounded-full border text-sm font-semibold transition",
      active
        ? "bg-primary/10 border-primary/20 text-primary"
        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50",
    ].join(" ")}
  >
    <span className={active ? "text-primary" : "text-gray-500"}>{icon}</span>
    <span>{label}</span>
    <span
      className={[
        "ml-1 text-xs font-bold px-2 py-0.5 rounded-full border",
        active
          ? "bg-white border-primary/20 text-primary"
          : "bg-gray-50 border-gray-200 text-gray-600",
      ].join(" ")}
    >
      {count}
    </span>
  </button>
);

const FranchiseDetailPage = () => {
  const { id } = useParams();
  const franchiseId = Number(id);

  // ✅ Tabs: mặc định mở "Nhân sự"
  const [tab, setTab] = useState<TabKey>("staff");

  const franchise = useMemo(
    () => FRANCHISE_SEED_DATA.find((f) => f.id === franchiseId),
    [franchiseId],
  );

  const staffRows = useMemo(() => {
    const rels = USER_FRANCHISE_ROLE_SEED_DATA.filter(
      (r) => r.franchiseId === franchiseId && !r.isDeleted,
    );

    return rels
      .map((r) => {
        const user = USER_SEED_DATA.find((u) => u.id === r.userId);
        const role = ROLE_SEED_DATA.find((x) => x.id === r.roleId);
        return {
          id: r.id,
          userName: user?.name ?? `User#${r.userId}`,
          email: user?.email ?? "-",
          phone: user?.phone ?? "-",
          role: role?.name ?? `Role#${r.roleId}`,
          scope: role?.scope ?? "-",
        };
      })
      .sort((a, b) => a.role.localeCompare(b.role));
  }, [franchiseId]);

  const productRows = useMemo(() => {
    const pf = PRODUCT_FRANCHISE_SEED_DATA.filter(
      (x) => x.franchiseId === franchiseId && !x.isDeleted,
    );

    return pf.map((x) => {
      const p = PRODUCT_SEED_DATA.find((pp) => pp.id === x.productId);
      return {
        id: x.id,
        productName: p?.name ?? `Product#${x.productId}`,
        sku: (p as any)?.SKU ?? (p as any)?.sku ?? "-",
        size: x.size,
        priceBase: x.priceBase,
        isActive: x.isActive,
      };
    });
  }, [franchiseId]);

  const inventoryRows = useMemo(() => {
    const inv = INVENTORY_SEED_DATA.filter(
      (i) =>
        !i.isDeleted && productRows.some((p) => p.id === i.productFranchiseId),
    );

    return inv
      .map((i) => {
        const pf = PRODUCT_FRANCHISE_SEED_DATA.find(
          (x) => x.id === i.productFranchiseId,
        );
        const p = PRODUCT_SEED_DATA.find((pp) => pp.id === pf?.productId);
        return {
          id: i.id,
          productName: p?.name ?? `PF#${i.productFranchiseId}`,
          sku: (p as any)?.SKU ?? (p as any)?.sku ?? "-",
          quantity: i.quantity,
          alertThreshold: i.alertThreshold,
          isActive: i.isActive,
        };
      })
      .sort((a, b) => a.productName.localeCompare(b.productName));
  }, [franchiseId, productRows]);

  if (!franchise) {
    return (
      <div className="p-6">
        <Link
          to="/admin/franchise"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Quay lại danh sách
        </Link>

        <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="text-lg font-semibold text-gray-900">
            Không tìm thấy chi nhánh
          </div>
          <p className="text-sm text-gray-600 mt-1">
            ID: <span className="font-medium">{String(id)}</span>
          </p>
        </div>
      </div>
    );
  }

  const statusTone: PillTone = franchise.isActive ? "success" : "danger";

  return (
    <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/admin/franchise"
            className={[
              "inline-flex items-center gap-2",
              "text-sm font-medium",
              "px-3 py-2 rounded-xl",
              "border border-gray-200 bg-white",
              "hover:bg-gray-50 transition",
              "shrink-0",
            ].join(" ")}
          >
            <ArrowLeft size={16} />
            Quay lại
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {franchise.logoUrl ? (
                <img
                  src={franchise.logoUrl}
                  alt={franchise.name}
                  className="w-10 h-10 rounded-xl border border-gray-200 object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-[11px] text-gray-500 shrink-0">
                  N/A
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                  {franchise.name}
                </h1>
                <p className="text-xs text-gray-600 truncate">
                  {franchise.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Pill text={franchise.code} tone="info" />
          <Pill
            text={franchise.isActive ? "Hoạt động" : "Ngưng hoạt động"}
            tone={statusTone}
          />
          <Pill text={`ID: ${franchise.id}`} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <TabPill
          active={tab === "staff"}
          icon={<Users size={16} />}
          label="Nhân sự"
          count={`${staffRows.length}`}
          onClick={() => setTab("staff")}
        />
        <TabPill
          active={tab === "product"}
          icon={<Package size={16} />}
          label="Sản phẩm"
          count={`${productRows.length}`}
          onClick={() => setTab("product")}
        />
        <TabPill
          active={tab === "inventory"}
          icon={<Boxes size={16} />}
          label="Tồn kho"
          count={`${inventoryRows.length}`}
          onClick={() => setTab("inventory")}
        />
      </div>

      <div className="flex-1 min-h-0">
        {tab === "staff" ? (
          <Panel
            title="Nhân sự"
            icon={<Users size={18} />}
            count={`${staffRows.length} người`}
          >
            <div className="min-w-full">
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <Th>Thông tin</Th>
                    <th className="hidden xl:table-cell py-2.5 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="hidden xl:table-cell py-2.5 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      SĐT
                    </th>
                  </tr>
                </thead>

                <tbody className="border-t border-gray-100">
                  {staffRows.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100">
                      <td className="py-3 pr-4 align-top text-sm text-gray-700">
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-gray-900 truncate">
                              {s.userName}
                            </span>
                            <Pill text={s.scope} />
                          </div>

                          <div className="text-gray-700">
                            <span className="font-medium">{s.role}</span>
                          </div>

                          <div className="xl:hidden text-xs text-gray-600 space-y-0.5">
                            <div className="break-words">
                              <span className="text-gray-400">Email:</span>{" "}
                              {s.email}
                            </div>
                            <div className="break-words">
                              <span className="text-gray-400">SĐT:</span>{" "}
                              {s.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="hidden xl:table-cell py-3 pr-4 align-top text-sm text-gray-600 break-words">
                        {s.email}
                      </td>
                      <td className="hidden xl:table-cell py-3 pr-4 align-top text-sm text-gray-600 break-words">
                        {s.phone}
                      </td>
                    </tr>
                  ))}

                  {staffRows.length === 0 && (
                    <EmptyRow
                      colSpan={3}
                      text="Chưa có nhân sự gắn với chi nhánh này."
                    />
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        ) : null}

        {tab === "product" ? (
          <Panel
            title="Sản phẩm"
            icon={<Package size={18} />}
            count={`${productRows.length} món`}
          >
            <div className="min-w-full">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <Th>Tên</Th>
                    <Th>SKU</Th>
                    <Th>Size</Th>
                    <Th>Giá</Th>
                    <Th>Trạng thái</Th>
                  </tr>
                </thead>
                <tbody className="border-t border-gray-100">
                  {productRows.map((p) => (
                    <tr key={p.id} className="border-b border-gray-100">
                      <Td strong>{p.productName}</Td>
                      <Td className="text-gray-600">{p.sku}</Td>
                      <Td className="text-gray-600">{p.size}</Td>
                      <Td>{Number(p.priceBase).toLocaleString("vi-VN")}đ</Td>
                      <Td>
                        <Pill
                          text={p.isActive ? "Hoạt động" : "Tắt"}
                          tone={p.isActive ? "success" : "danger"}
                        />
                      </Td>
                    </tr>
                  ))}
                  {productRows.length === 0 && (
                    <EmptyRow
                      colSpan={5}
                      text="Chưa có sản phẩm gắn với chi nhánh này."
                    />
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        ) : null}

        {tab === "inventory" ? (
          <Panel
            title="Tồn kho"
            icon={<Boxes size={18} />}
            count={`${inventoryRows.length} dòng`}
          >
            <div className="min-w-full">
              <table className="w-full table-fixed">
                <thead>
                  <tr>
                    <Th>Thông tin</Th>
                    <th className="hidden xl:table-cell py-2.5 pr-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Cảnh báo
                    </th>
                    <Th>Trạng thái</Th>
                  </tr>
                </thead>

                <tbody className="border-t border-gray-100">
                  {inventoryRows.map((i) => {
                    const low =
                      Number(i.quantity) <= Number(i.alertThreshold || 0);

                    return (
                      <tr key={i.id} className="border-b border-gray-100">
                        <td className="py-3 pr-4 align-top text-sm text-gray-700">
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {i.productName}
                            </div>
                            <div className="text-xs text-gray-600 break-words">
                              SKU: {i.sku}
                            </div>

                            <div className="xl:hidden text-xs text-gray-600">
                              <div>
                                SL:{" "}
                                <span
                                  className={
                                    low
                                      ? "text-rose-700 font-semibold"
                                      : "text-gray-900"
                                  }
                                >
                                  {Number(i.quantity).toLocaleString("vi-VN")}
                                </span>
                              </div>
                              <div>
                                Cảnh báo:{" "}
                                {Number(i.alertThreshold).toLocaleString(
                                  "vi-VN",
                                )}
                              </div>
                            </div>

                            <div className="hidden xl:block text-sm">
                              SL:{" "}
                              <span
                                className={
                                  low
                                    ? "text-rose-700 font-semibold"
                                    : "text-gray-900"
                                }
                              >
                                {Number(i.quantity).toLocaleString("vi-VN")}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="hidden xl:table-cell py-3 pr-4 align-top text-sm text-gray-600">
                          {Number(i.alertThreshold).toLocaleString("vi-VN")}
                        </td>

                        <td className="py-3 pr-0 align-top text-sm">
                          <Pill
                            text={i.isActive ? "AVAILABLE" : "OUT_OF_STOCK"}
                            tone={i.isActive ? "success" : "danger"}
                          />
                        </td>
                      </tr>
                    );
                  })}

                  {inventoryRows.length === 0 && (
                    <EmptyRow
                      colSpan={3}
                      text="Chưa có dữ liệu tồn kho cho chi nhánh này."
                    />
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
};

export default FranchiseDetailPage;
