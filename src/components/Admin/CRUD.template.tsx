import React, { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";

type CrudColumn<T> = {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  className?: string;
};

type CrudStatCard = {
  label: string;
  value: string | number;
  description?: string;
  tone?: "default" | "success" | "danger";
};

type RenderFiltersProps<TFilterState> = {
  filterState: TFilterState;
  setFilterState: React.Dispatch<React.SetStateAction<TFilterState>>;
};

export type AdminCrudTemplateProps<TItem, TFilterState = Record<string, never>> = {
  title: string;
  subtitle?: string;
  addLabel?: string;
  onAdd?: () => void;
  data: TItem[];
  columns: CrudColumn<TItem>[];
  getRowKey: (item: TItem) => React.Key;
  actions?: (item: TItem) => React.ReactNode;
  stats?: CrudStatCard[];
  searchKeys?: Array<keyof TItem | string>;
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  emptyState?: React.ReactNode;
  initialFilterState?: TFilterState;
  filterPredicate?: (item: TItem, searchTerm: string, filterState: TFilterState) => boolean;
  renderFilters?: (props: RenderFiltersProps<TFilterState>) => React.ReactNode;
};

const DEFAULT_PAGE_SIZES = [10, 20, 50];

const resolveValue = <TItem,>(item: TItem, key: keyof TItem | string): string => {
  const value = (item as Record<string, unknown>)[key as string];
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return String(value);
};

const toneClassMap: Record<Required<CrudStatCard>["tone"], string> = {
  default: "text-gray-900",
  success: "text-emerald-600",
  danger: "text-rose-600",
};

const alignClassMap: Record<NonNullable<CrudColumn<unknown>["align"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const AdminCrudTemplate = <TItem, TFilterState = Record<string, never>>({
  title,
  subtitle,
  addLabel = "Thêm mới",
  onAdd,
  data,
  columns,
  getRowKey,
  actions,
  stats = [],
  searchKeys = [],
  searchPlaceholder = "Tìm kiếm...",
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  emptyState,
  initialFilterState,
  filterPredicate,
  renderFilters,
}: AdminCrudTemplateProps<TItem, TFilterState>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(pageSizeOptions[0] ?? DEFAULT_PAGE_SIZES[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterState, setFilterState] = useState<TFilterState>(
    () => initialFilterState ?? ({} as TFilterState),
  );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const handleFilterStateChange: React.Dispatch<React.SetStateAction<TFilterState>> = (updater) => {
    setFilterState((prev) => {
      const next = typeof updater === "function" ? (updater as (state: TFilterState) => TFilterState)(prev) : updater;
      return next;
    });
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    const loweredSearch = searchTerm.trim().toLowerCase();

    return data.filter((item) => {
      const matchesSearch =
        loweredSearch.length === 0 ||
        searchKeys.length === 0
          ? true
          : searchKeys.some((key) => resolveValue(item, key).toLowerCase().includes(loweredSearch));

      const matchesFilter = filterPredicate
        ? filterPredicate(item, loweredSearch, filterState)
        : true;

      return matchesSearch && matchesFilter;
    });
  }, [data, searchKeys, searchTerm, filterPredicate, filterState]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safePage, pageSize]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-white shadow hover:bg-amber-700"
          >
            <Plus size={16} /> {addLabel}
          </button>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="text-xs uppercase tracking-tight text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-semibold ${toneClassMap[stat.tone ?? "default"]}`}>
                {stat.value}
              </p>
              {stat.description && <p className="text-sm text-gray-500">{stat.description}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            {renderFilters && (
              <div className="flex items-center gap-2">
                {renderFilters({ filterState, setFilterState: handleFilterStateChange })}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị</span>
            <select
              value={pageSize}
              onChange={(event) => handlePageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} / trang
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-3 ${alignClassMap[column.align ?? "left"]} ${column.className ?? ""}`}
                    style={{ width: column.width }}
                  >
                    {column.header}
                  </th>
                ))}
                {actions && <th className="px-4 py-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedData.map((item) => (
                <tr key={getRowKey(item)} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={`${getRowKey(item)}-${String(column.key)}`}
                      className={`px-4 py-3 ${alignClassMap[column.align ?? "left"]} ${column.className ?? ""}`}
                    >
                      {column.render ? column.render(item) : resolveValue(item, column.key)}
                    </td>
                  ))}
                  {actions && <td className="px-4 py-3">{actions(item)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedData.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-500">
            {emptyState ?? "Không có dữ liệu phù hợp."}
          </div>
        )}

        {paginatedData.length > 0 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              {paginatedData.length} / {filteredData.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {safePage}/{totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export type { CrudColumn, CrudStatCard };
export default AdminCrudTemplate;