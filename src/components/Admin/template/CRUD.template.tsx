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
  Eye,
  Check,
  ChevronDown,
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
  key: keyof T;
  label: string;
  options: FilterOption[];
}

export interface CRUDTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  tableMaxHeightClass?: string;

  onAdd?: () => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;

  statusField?: keyof T;
  onStatusChange?: (item: T, newStatus: boolean) => void;

  searchKeys?: (keyof T)[];
  filters?: FilterConfig<T>[];

  /**
   * When true, search/filter inputs are "pending" until user clicks the apply button (or presses Enter).
   * Default: false (auto-apply on change).
   */
  deferToolsApply?: boolean;
  applyButtonLabel?: string;

  searchRight?: React.ReactNode;
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
      onClick={() => {
        if (disabled) return;
        onChange(!checked);
      }}
      className={`
        relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
        ${checked ? "bg-primary" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <span className="sr-only">Toggle</span>
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

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  position?: "top" | "bottom";
}

const CustomSelect = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  className,
  position = "bottom",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      className={`relative ${className || "min-w-[200px]"}`}
      ref={containerRef}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 w-full py-2 pl-3 pr-3 text-sm bg-white border rounded-lg cursor-pointer transition-all select-none
          ${isOpen ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-gray-300"}
        `}
      >
        {icon && <span className="text-gray-500">{icon}</span>}
        <span
          className={`flex-1 truncate ${!selectedOption ? "text-gray-500" : "text-gray-700"}`}
        >
          {selectedOption ? selectedOption.label : placeholder || "Select..."}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100
          ${position === "top" ? "bottom-full mb-1" : "mt-1"}
          `}
        >
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors
                  ${
                    option.value === value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <span className="truncate">{option.label}</span>
                {option.value === value && (
                  <Check className="w-3.5 h-3.5 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Template ---

export function CRUDTable<T extends { id?: string | number }>({
  title,
  data,
  columns,
  pageSize = 5,
  tableMaxHeightClass,
  onAdd,
  onView,
  onEdit,
  onDelete,
  statusField,
  onStatusChange,
  searchKeys = [],
  filters = [],
  searchRight,
  deferToolsApply = false,
  applyButtonLabel = "Tìm kiếm",
}: CRUDTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [activeFilters, setActiveFilters] = useState<
    Partial<Record<keyof T, string>>
  >({});
  const [pendingFilters, setPendingFilters] = useState<
    Partial<Record<keyof T, string>>
  >({});

  const handleApplyTools = () => {
    if (!deferToolsApply) return;
    setSearchTerm(searchInput);
    setActiveFilters(pendingFilters);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        searchKeys.length === 0 ||
        searchKeys.some((key) => {
          const value = item[key];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        });

      if (!matchesSearch) return false;

      const matchesFilters = filters.every((filter) => {
        const activeValue = activeFilters[filter.key];
        if (!activeValue || activeValue === "all") return true;
        return String(item[filter.key]) === activeValue;
      });

      return matchesFilters;
    });
  }, [data, searchTerm, activeFilters, searchKeys, filters]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

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
    if (!onStatusChange || !statusField) return;
    const currentVal = !!item[statusField];
    onStatusChange(item, !currentVal);
  };

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
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:flex-nowrap sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 uppercase">{title}</h2>
        </div>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mới</span>
          </button>
        )}
      </div>

      {/* Tools */}
      <div className="p-4 bg-gray-50/50 flex flex-col md:flex-row md:flex-nowrap gap-3 items-center justify-between border-b border-gray-100">
        {/* Search + slot */}
        <div className="w-full md:w-auto flex items-center gap-3">
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
              value={searchInput}
              onChange={(e) => {
                const nextValue = e.target.value;
                setSearchInput(nextValue);
                if (!deferToolsApply) {
                  setSearchTerm(nextValue);
                }
              }}
              onKeyDown={(e) => {
                if (!deferToolsApply) return;
                if (e.key === "Enter") {
                  handleApplyTools();
                }
              }}
            />
          </div>

          {searchRight ? <div className="shrink-0">{searchRight}</div> : null}
        </div>

        {/* Filters */}
        {filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {filters.map((filter) => (
              <CustomSelect
                key={String(filter.key)}
                value={
                  (deferToolsApply
                    ? pendingFilters[filter.key]
                    : activeFilters[filter.key]) || "all"
                }
                onChange={(newValue) => {
                  if (deferToolsApply) {
                    setPendingFilters((prev) => ({
                      ...prev,
                      [filter.key]: newValue,
                    }));
                    return;
                  }
                  setActiveFilters((prev) => ({
                    ...prev,
                    [filter.key]: newValue,
                  }));
                }}
                options={[
                  { value: "all", label: `Tất cả ${filter.label}` },
                  ...filter.options,
                ]}
                icon={<Filter className="w-4 h-4" />}
              />
            ))}
          </div>
        )}

        {deferToolsApply ? (
          <button
            type="button"
            onClick={handleApplyTools}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer md:ml-auto w-full md:w-auto"
            title={applyButtonLabel}
          >
            <Search className="w-4 h-4" />
            <span>{applyButtonLabel}</span>
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div
        className={`overflow-x-auto overflow-y-auto ${tableMaxHeightClass || ""}`}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 whitespace-nowrap">
                #
              </th>

              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
                    col.className || ""
                  } ${
                    col.sortable
                      ? "cursor-pointer hover:bg-gray-100 transition-colors"
                      : ""
                  }`}
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

              {statusField && (
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center whitespace-nowrap">
                  Trạng thái
                </th>
              )}

              {(onView || onEdit || onDelete) && (
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">
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
                  <td className="px-4 py-3 text-sm text-gray-500 font-medium align-middle whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>

                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className="px-4 py-3 text-sm text-gray-700 align-middle whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(item)
                        : typeof col.accessor === "function"
                          ? col.accessor(item)
                          : (item[col.accessor as keyof T] as React.ReactNode)}
                    </td>
                  ))}

                  {statusField && (
                    <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {/* ✅ DISABLE khi không có onStatusChange */}
                        <ToggleSwitch
                          checked={!!item[statusField]}
                          onChange={() => toggleStatus(item)}
                          disabled={!onStatusChange}
                        />
                        <span
                          className={`text-[10px] font-medium uppercase ${
                            item[statusField] ? "text-primary" : "text-gray-400"
                          }`}
                        >
                          {item[statusField] ? "Hoạt động" : "Ngưng"}
                        </span>
                      </div>
                    </td>
                  )}

                  {(onView || onEdit || onDelete) && (
                    <td className="px-4 py-3 text-right align-middle whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {onView && (
                          <button
                            onClick={() => onView(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(item)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-5 h-5" />
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
                    1 +
                    (statusField ? 1 : 0) +
                    (onView || onEdit || onDelete ? 1 : 0)
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

      {/* Footer Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              {[5, 10, 20, 50, 100, pageSize]
                .filter((value, index, self) => self.indexOf(value) === index)
                .sort((a, b) => a - b)
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
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {(() => {
              let startPage = 1;
              const maxPagesToShow = 5;

              if (totalPages > maxPagesToShow) {
                if (currentPage <= 3) startPage = 1;
                else if (currentPage >= totalPages - 2)
                  startPage = totalPages - 4;
                else startPage = currentPage - 2;
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
                        cursor-pointer
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
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
