import React, { useState, useMemo, useEffect } from "react";
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
  RotateCw,
  CircleCheckBig,
} from "lucide-react";
import CustomSelect from "../filters/CustomSelect";

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
  defaultValue?: string;
}

export interface CRUDPageTemplateProps<T> {
  title: React.ReactNode;
  data: T[];
  columns: Column<T>[];
  selectedRowId?: string | number;
  onRowClick?: (item: T) => void;
  pageSize?: number;

  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  tableMaxHeightClass?: string;

  onAdd?: () => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  canEdit?: (item: T) => boolean;
  onDelete?: (item: T) => void;
  onRestore?: (item: T) => void;
  statusField?: keyof T;
  onStatusChange?: (item: T, newStatus: boolean) => void;

  onChangeOrderStatus?: (item: T) => void;
  canChangeOrderStatus?: (item: T) => boolean;

  searchKeys?: (keyof T)[];
  searchRight?: React.ReactNode;
  searchContent?: React.ReactNode;
  headerRight?: React.ReactNode;
  filters?: FilterConfig<T>[];
  onRefresh?: () => void;

  onSearch?: (term: string, filters?: Partial<Record<keyof T, string>>) => void;

  isTableLoading?: boolean;
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
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 
            ${checked ? "bg-primary" : "bg-gray-300"} 
            ${disabled ? "opacity-80" : "cursor-pointer"}`}
  >
    <span className="sr-only">Toggle</span>
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out 
            ${checked ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

// --- Main Template ---
export function CRUDPageTemplate<
  T extends { id?: string | number; _id?: string },
>({
  title,
  data,
  columns,

  pageSize,

  totalItems,
  currentPage,
  onPageChange,
  onPageSizeChange,

  tableMaxHeightClass,

  onAdd,
  onView,
  onEdit,
  canEdit,
  onDelete,
  onRestore,

  onRowClick,
  selectedRowId,
  headerRight,
  onChangeOrderStatus,
  canChangeOrderStatus,

  onStatusChange,
  statusField,

  filters = [],
  searchRight,
  searchContent,

  onRefresh,
  onSearch,

  isTableLoading,
}: CRUDPageTemplateProps<T>) {
  const page = currentPage ?? 1;
  const [pageSizeState, setPageSizeState] = useState(pageSize ?? 10);
  const [pageInput, setPageInput] = useState(page);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [inputValue, setInputValue] = useState("");

  const [filterInput, setFilterInput] = useState<
    Partial<Record<keyof T, string>>
  >(() => {
    const initial: Partial<Record<keyof T, string>> = {};
    filters.forEach((f) => {
      if (f.key === "is_deleted") {
        initial[f.key] = "false";
      } else if (f.defaultValue) {
        initial[f.key] = f.defaultValue;
      } else {
        initial[f.key] = "";
      }
    });
    return initial;
  });

  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  const filteredData = data;

  useEffect(() => {
    if (pageSize) {
      setPageSizeState(pageSize);
    }
  }, [pageSize]);

  useEffect(() => {
    setPageInput(page);
  }, [page]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (
        sortConfig.key === "name" &&
        typeof aValue === "string" &&
        typeof bValue === "string"
      ) {
        // Sort theo Tên (từ cuối cùng) thay vì Họ
        const nameA = aValue.trim().split(" ").pop()?.toLowerCase() || "";
        const nameB = bValue.trim().split(" ").pop()?.toLowerCase() || "";

        if (nameA !== nameB) {
          return sortConfig.direction === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }
      }

      // Sắp xếp mặc định cho các field khác
      if (aValue === bValue) return 0;
      if (aValue == null || bValue == null) return 0;
      const result = aValue < bValue ? -1 : 1;
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(
    (totalItems ?? sortedData.length) / pageSizeState,
  );

  const currentData = sortedData;

  const goToPage = (value: number) => {
    const newPage = Math.min(Math.max(value || 1, 1), totalPages);
    onPageChange?.(newPage);
  };

  const handleToggleStatus = (item: T) => {
    if (!statusField || !onStatusChange) return;
    const currentStatus = item[statusField] as boolean;
    onStatusChange(item, !currentStatus);
  };

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

  const handleSearch = () => {
    if (onSearch) {
      onSearch(inputValue, filterInput);
    }
  };

  const handleRefresh = () => {
    const resetFilters: Partial<Record<keyof T, string>> = {};
    filters.forEach((f) => {
      resetFilters[f.key] = f.key === "is_deleted" ? "false" : "";
    });
    setFilterInput(resetFilters);
    setInputValue("");
    onPageChange?.(1);
    if (onRefresh) {
      onRefresh();
    } else {
      onSearch?.("", resetFilters);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSizeState(newSize);
    tableContainerRef.current?.scrollTo({
      top: 0,
    });
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  const goPrevPage = () => {
    if (page > 1) {
      tableContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      onPageChange?.(page - 1);
    }
  };

  const goNextPage = () => {
    if (page < totalPages) {
      tableContainerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      onPageChange?.(page + 1);
    }
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

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const handleKeyNavigation = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!currentData.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, currentData.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const item = currentData[focusedIndex];
      if (item && onRowClick) {
        onRowClick(item);
      }
    }

    if (e.key === " " || e.code === "Space") {
      e.preventDefault();

      const row = tableContainerRef.current?.querySelectorAll(
        "tbody input[type='checkbox']",
      )[focusedIndex] as HTMLInputElement | undefined;

      row?.click();
    }
  };
  useEffect(() => {
    const rows = tableContainerRef.current?.querySelectorAll("tbody tr");

    const row = rows?.[focusedIndex] as HTMLElement | undefined;

    if (row) {
      row.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [focusedIndex]);

  const handleRestore = (item: T) => {
    const newFilters: Partial<Record<keyof T, string>> = {
      ...filterInput,
      is_deleted: "false",
    };
    setFilterInput(newFilters);
    setInputValue("");
    if (onSearch) {
      onSearch("", newFilters);
    }
    onRestore?.(item);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-white overflow-hidden font-sans">
      {/* Header */}
      <div className="px-8 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:flex-nowrap sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800 uppercase">{title}</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {headerRight}
          {onAdd && (
            <button
              onClick={onAdd}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md active:scale-[0.95] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mới</span>
            </button>
          )}
        </div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="px-4 md:px-8 py-3 bg-gray-50/50 flex flex-col lg:flex-row gap-3 lg:items-center"
      >
        {/* SEARCH */}
        <div className="relative w-full lg:flex-1 group">
          {searchContent ? (
            <div className="w-full">{searchContent}</div>
          ) : (
            <>
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
            </>
          )}
        </div>

        {/* FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {filters.map((filter) => (
            <CustomSelect
              key={String(filter.key)}
              value={filterInput[filter.key] as string}
              onChange={(newValue) =>
                setFilterInput((prev) => ({
                  ...prev,
                  [filter.key]: newValue,
                }))
              }
              options={[
                { value: "", label: `Tất cả ${filter.label}` },
                ...filter.options,
              ]}
              icon={<Filter className="w-4 h-4" />}
              className="w-full sm:min-w-45"
            />
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            type="submit"
            className="flex-1 sm:flex-none px-4 py-2 text-sm rounded-lg bg-primary text-white 
              transition-all duration-200 active:scale-95 hover:brightness-110 cursor-pointer"
          >
            Tìm kiếm
          </button>

          <button
            title="Làm mới"
            type="button"
            onClick={handleRefresh}
            className="px-3 py-2 text-sm rounded-lg bg-gray-200 text-gray-600 
              transition-all duration-200 active:scale-95 hover:bg-gray-300 cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* RIGHT SLOT */}
        {searchRight && (
          <div className="w-full lg:w-auto lg:ml-auto flex justify-end">
            {searchRight}
          </div>
        )}
      </form>

      {/* Table */}
      <div
        ref={tableContainerRef}
        tabIndex={0}
        onKeyDown={handleKeyNavigation}
        className={`outline-none focus:outline-none px-3 md:px-6 lg:px-8 py-3 flex-1 overflow-auto scrollBar-hide ${tableMaxHeightClass || ""}`}
      >
        <div className="relative w-full rounded-lg border border-gray-200">
          {isTableLoading && (
            <div className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center gap-3 z-20">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">
                Đang tải dữ liệu...
              </p>
            </div>
          )}

          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur supports-[backdrop-filter]:bg-gray-50/70 border-b border-gray-200">
              <tr>
                <th className="w-12 px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">
                  #
                </th>

                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={`px-3 py-3 text-xs font-semibold text-gray-500 uppercase
                        ${col.className || ""}
                        ${col.sortable ? "cursor-pointer hover:bg-gray-100" : ""}`}
                    onClick={() =>
                      col.sortable &&
                      typeof col.accessor === "string" &&
                      handleSort(col.accessor as keyof T)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate">{col.header}</span>
                      {col.sortable &&
                        typeof col.accessor === "string" &&
                        renderSortIcon(col.accessor as string)}
                    </div>
                  </th>
                ))}

                {statusField && (
                  <th className="w-32 px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">
                    Trạng thái
                  </th>
                )}

                {(onView || onEdit || onDelete || onChangeOrderStatus) && (
                  <th className="w-40 px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">
                    Hành động
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentData.length > 0 ? (
                currentData.map((item, index) => {
                  const isDeleted = Boolean((item as any).is_deleted);

                  return (
                    <tr
                      key={item.id ?? index}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;

                        if (target.closest("button") || target.closest("a")) {
                          return;
                        }

                        if (!target.closest("input[type='checkbox']")) {
                          const checkbox = e.currentTarget.querySelector(
                            "input[type='checkbox']",
                          ) as HTMLInputElement | null;

                          checkbox?.click();
                        }

                        onRowClick?.(item);
                      }}
                      className={`transition-colors cursor-pointer
                        ${
                          focusedIndex === index
                            ? "bg-primary/10"
                            : item.id === selectedRowId
                              ? "bg-primary/5"
                              : isDeleted
                                ? "bg-gray-50 text-gray-400"
                                : "bg-white hover:bg-primary/5"
                        }`}
                    >
                      <td className="px-4 py-3 text-center text-gray-500">
                        {(page - 1) * pageSizeState + index + 1}
                      </td>

                      {columns.map((col, idx) => (
                        <td
                          key={idx}
                          className="px-4 py-3 text-gray-700 max-w-75 truncate"
                        >
                          {col.render
                            ? col.render(item)
                            : typeof col.accessor === "function"
                              ? col.accessor(item)
                              : (item[col.accessor as keyof T] as any)}
                        </td>
                      ))}

                      {statusField && (
                        <td className="px-4 py-3 text-center">
                          {!isDeleted ? (
                            <div className="flex flex-col items-center gap-1">
                              <ToggleSwitch
                                checked={!!item[statusField]}
                                onChange={() => handleToggleStatus(item)}
                                disabled={!onStatusChange}
                              />
                              <span
                                className={`text-[9px] font-medium uppercase
                                    ${
                                      item[statusField]
                                        ? "text-primary"
                                        : "text-gray-400"
                                    }`}
                              >
                                {item[statusField]
                                  ? "Hoạt động"
                                  : "Ngưng hoạt động"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <ToggleSwitch
                                checked={false}
                                onChange={() => {}}
                                disabled
                              />
                              <span
                                className={`text-[9px] font-medium uppercase text-gray-400`}
                              >
                                {item[statusField]
                                  ? "Hoạt động"
                                  : "Ngưng hoạt động"}
                              </span>
                            </div>
                          )}
                        </td>
                      )}

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isDeleted && onView && (
                            <button
                              title="Xem chi tiết"
                              onClick={() => onView(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition active:scale-90 cursor-pointer"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          {!isDeleted &&
                            onChangeOrderStatus &&
                            (!canChangeOrderStatus ||
                              canChangeOrderStatus(item)) && (
                              <button
                                title="Đổi trạng thái"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onChangeOrderStatus(item);
                                }}
                                className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition active:scale-90 cursor-pointer"
                              >
                                <CircleCheckBig className="w-5 h-5" />{" "}
                              </button>
                            )}

                          {!isDeleted &&
                            onEdit &&
                            (!canEdit || canEdit(item)) && (
                              <button
                                title="Chỉnh sửa"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit(item);
                                }}
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition active:scale-90 cursor-pointer"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            )}

                          {!isDeleted && onDelete && (
                            <button
                              title="Xóa"
                              onClick={() => onDelete(item)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition active:scale-90 cursor-pointer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}

                          {isDeleted && onRestore && (
                            <button
                              title="Khôi phục"
                              onClick={() => handleRestore(item)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition active:scale-90 cursor-pointer"
                            >
                              <RotateCw className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={100}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Không tìm thấy dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Pagination */}
      <div className="px-8 py-3 border-t border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              title="Số mục mỗi trang"
              value={pageSizeState}
              onChange={handlePageSizeChange}
              className="border border-gray-200 rounded-lg px-2 py-1 bg-white cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
            >
              {[10, 20, 50, 100].map((size) => (
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
              {totalItems ?? data.length}
            </span>{" "}
            kết quả
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            title="Trang trước"
            onClick={goPrevPage}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <input
              title="Trang hiện tại"
              type="number"
              min={1}
              max={totalPages || 1}
              value={pageInput}
              onChange={(e) => setPageInput(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") goToPage(pageInput);
              }}
              onBlur={() => goToPage(pageInput)}
              className="w-12 text-center border border-gray-200 rounded-md py-1 outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span>/ {totalPages}</span>
          </div>
          <button
            title="Trang tiếp theo"
            onClick={goNextPage}
            disabled={page === totalPages || totalPages === 0}
            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
