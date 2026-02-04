import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";

// --- Types ---

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig<T> {
  key: keyof T; // The key in data to filter by
  label: string;
  options: FilterOption[];
}

export interface CRUDTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  pageSize?: number;

  // Actions
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;

  // Status specific
  statusField?: keyof T; // e.g., 'isActive' or 'status'
  onStatusChange?: (item: T, newStatus: boolean) => void;

  // Configuration
  searchKeys?: (keyof T)[]; // Which fields to search in
  filters?: FilterConfig<T>[];
}

// --- Components ---

const ToggleSwitch = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${checked ? "bg-primary" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
};

// --- Main Template ---

export function CRUDTable<T extends { id?: string | number }>({
  title,
  data,
  columns,
  pageSize = 5,
  onAdd,
  onEdit,
  onDelete,
  statusField,
  onStatusChange,
  searchKeys = [],
  filters = [],
}: CRUDTableProps<T>) {
  // --- State ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize); // Internal state for page size
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [activeFilters, setActiveFilters] = useState<
    Partial<Record<keyof T, string>>
  >({});

  // --- Logic ---

  // 1. Filter & Search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search
      const matchesSearch =
        searchKeys.length === 0 ||
        searchKeys.some((key) => {
          const value = item[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });

      if (!matchesSearch) return false;

      // Fitlers
      const matchesFilters = filters.every((filter) => {
        const activeValue = activeFilters[filter.key];
        if (!activeValue || activeValue === "all") return true;

        // Loose equality check for strings/numbers
        return String(item[filter.key]) === activeValue;
      });

      return matchesFilters;
    });
  }, [data, searchTerm, activeFilters, searchKeys, filters]);

  // 2. Sort
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      // Handle simple accessors for now.
      // If accessor is a function, sorting might be tricky without extra config,
      // check if sortConfig.key corresponds to a simple property
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  // Reset page when filter/search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  // --- Handlers ---

  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const toggleStatus = (item: T) => {
    if (onStatusChange && statusField) {
      // Determine current boolean value
      const currentVal = !!item[statusField];
      onStatusChange(item, !currentVal);
    }
  };

  // --- Render Helpers ---

  const renderSortIcon = (columnKey: string) => {
    if (!sortConfig || (sortConfig.key as unknown as string) !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-50" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-4 h-4 text-primary" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary" />
    );
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-sans">
      {/* --- Header Section --- */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 uppercase">{title}</h2>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md active:transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </button>
        )}
      </div>

      {/* --- Tools Section (Search & Filter) --- */}
      <div className="p-4 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-100">
        {/* Search */}
        <div className="relative w-full md:w-72 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-white
                       text-sm text-gray-900 placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                       transition-all hover:border-gray-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {filters.map((filter) => (
              <div
                key={String(filter.key)}
                className="flex items-center gap-2 min-w-[200px]"
              >
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  className="block w-full py-2 pl-3 pr-8 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:border-gray-300 transition-all"
                  value={activeFilters[filter.key] || ""}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      [filter.key]: e.target.value,
                    }))
                  }
                >
                  <option value="all">Tất cả {filter.label}</option>
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Table Section --- */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              {/* Header Columns */}
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">
                #
              </th>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ""} ${col.sortable ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""}`}
                  onClick={() => {
                    if (col.sortable && typeof col.accessor === "string") {
                      handleSort(col.accessor as keyof T);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {col.header}
                    {col.sortable &&
                      typeof col.accessor === "string" &&
                      renderSortIcon(col.accessor as string)}
                  </div>
                </th>
              ))}

              {/* Status Column (Optional) */}
              {statusField && (
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                  Trạng thái
                </th>
              )}

              {/* Actions Column */}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Hành động
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="bg-white hover:bg-primary/5 transition-colors group"
                >
                  {/* Index */}
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {(currentPage - 1) * pageSize + index + 1}
                  </td>

                  {/* Data Cells */}
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm text-gray-700">
                      {col.render
                        ? col.render(item)
                        : typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor as keyof T] as React.ReactNode)}
                    </td>
                  ))}

                  {/* Status Switch */}
                  {statusField && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <ToggleSwitch
                          checked={!!item[statusField]}
                          onChange={() => toggleStatus(item)}
                        />
                        <span
                          className={`text-[10px] font-medium uppercase ${item[statusField] ? "text-primary" : "text-gray-400"}`}
                        >
                          {item[statusField] ? "Hoạt động" : "Ngưng"}
                        </span>
                      </div>
                    </td>
                  )}

                  {/* Actions */}
                  {(onEdit || onDelete) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors tooltip"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (statusField ? 2 : 1) +
                    (onEdit || onDelete ? 1 : 0)
                  }
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <p>Không tìm thấy dữ liệu nào phù hợp.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Footer Pagination --- */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page
              }}
              className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {[5, 10, 20, 50, 100, pageSize]
                .filter((value, index, self) => self.indexOf(value) === index) // Unique
                .sort((a, b) => a - b) // Sort
                .map((size) => (
                  <option key={size} value={size}>
                    {size} / trang
                  </option>
                ))}
            </select>
          </div>
          <div className="text-gray-400">|</div>
          <div>
            Tổng số{" "}
            <span className="font-medium text-gray-900">
              {filteredData.length}
            </span>{" "}
            kết quả
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {(() => {
              let startPage = 1;
              const maxPagesToShow = 5;

              if (totalPages > maxPagesToShow) {
                if (currentPage <= 3) {
                  startPage = 1;
                } else if (currentPage >= totalPages - 2) {
                  startPage = totalPages - 4;
                } else {
                  startPage = currentPage - 2;
                }
              }

              return Array.from(
                { length: Math.min(maxPagesToShow, totalPages) },
                (_, i) => {
                  const p = startPage + i;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`
                      w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
                      ${
                        currentPage === p
                          ? "bg-primary text-white shadow-sm"
                          : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                      }
                    `}
                    >
                      {p}
                    </button>
                  );
                },
              );
            })()}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
