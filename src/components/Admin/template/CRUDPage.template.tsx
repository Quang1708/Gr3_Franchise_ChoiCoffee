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
    RotateCw,
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

export interface CRUDPageTemplateProps<T> {
    title: string;
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
    tableMaxHeightClass?: string;

    onAdd?: () => void;
    onView?: (item: T) => void;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onRestore?: (item: T) => void;
    statusField?: keyof T;
    onStatusChange?: (item: T, newStatus: boolean) => void;

    searchKeys?: (keyof T)[];
    searchRight?: React.ReactNode;
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
}) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 
            ${checked ? "bg-primary" : "bg-gray-300"} 
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
        <span className="sr-only">Toggle</span>
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out 
            ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
);

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

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node))
                setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt: any) => opt.value === value);

    return (
        <div className={`relative ${className || "min-w-[200px]"}`} ref={containerRef}>
            <div onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 w-full py-2 px-3 text-sm bg-white border rounded-lg cursor-pointer transition-all select-none 
                    ${isOpen ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-gray-300"}`}>
                {icon && <span className="text-gray-500">{icon}</span>}
                <span className={`flex-1 truncate ${!selectedOption ? "text-gray-500" : "text-gray-700"}`}>
                    {selectedOption ? selectedOption.label : placeholder || "Chọn..."}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div className={`absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto mt-1 ${position === "top" ? "bottom-full mb-1" : "mt-1"}`}>
                    <div className="p-1">
                        {options.map((opt: any) => (
                            <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer ${opt.value === value ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                                <span className="truncate">{opt.label}</span>
                                {opt.value === value && <Check className="w-3.5 h-3.5" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main Template ---
export function CRUDPageTemplate<T extends { id?: string | number }>({
    title,
    data,
    columns,
    pageSize = 5,
    tableMaxHeightClass,
    onAdd,
    onView,
    onEdit,
    onDelete,
    onRestore,
    onStatusChange,
    statusField,
    searchKeys = [],
    filters = [],
    searchRight,
}: CRUDPageTemplateProps<T>) {

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(pageSize);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [filterInput, setFilterInput] = useState<Partial<Record<keyof T, string>>>({});
    const [activeFilters, setActiveFilters] = useState<Partial<Record<keyof T, string>>>({});
    const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc"; } | null>(null);


    const toggleStatus = (item: T) => {
        if (!statusField || !onStatusChange) return;

        const currentStatus = item[statusField] as boolean;
        onStatusChange(item, !currentStatus);
    };

    // Filters
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            const matchesSearch =
                searchTerm === "" || // Nếu không nhập gì thì luôn true
                (searchKeys.length > 0
                    ? searchKeys.some((key) => {
                        const value = item[key];
                        return value != null && String(value).toLowerCase().includes(searchTerm.toLowerCase());
                    })
                    : Object.values(item).some((val) => // Nếu không truyền searchKeys, tìm trên tất cả các field
                        String(val).toLowerCase().includes(searchTerm.toLowerCase())
                    ));

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

            if (sortConfig.key === "name" && typeof aValue === 'string' && typeof bValue === 'string') {
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
            const result = aValue < bValue ? -1 : 1;
            return sortConfig.direction === "asc" ? result : -result;
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

    const renderSortIcon = (columnKey: string) => {
        if (!sortConfig || (sortConfig.key as unknown as string) !== columnKey) {
            return <ArrowUpDown className="w-4 h-4 text-gray-400 opacity-50" />;
        }

        return sortConfig.direction === "asc"
            ? <ArrowUp className="w-4 h-4 text-primary" />
            : <ArrowDown className="w-4 h-4 text-primary" />;
    };

    return (
        <div className="w-full h-full flex flex-col bg-white overflow-hidden font-sans">
            {/* Header */}
            <div className="px-8 py-3 border-b border-gray-200 flex flex-col sm:flex-row sm:flex-nowrap sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 uppercase">{title}</h2>
                </div>
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

            <div className="px-4 md:px-8 py-3 bg-gray-50/50 flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="relative w-full lg:flex-1 group">
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
                    />
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    {filters.map((filter) => (
                        <CustomSelect
                            key={String(filter.key)}
                            value={filterInput[filter.key] || "all"}
                            onChange={(newValue) =>
                                setFilterInput((prev) => ({
                                    ...prev,
                                    [filter.key]: newValue,
                                }))
                            }
                            options={[
                                { value: "all", label: `Tất cả ${filter.label}` },
                                ...filter.options,
                            ]}
                            icon={<Filter className="w-4 h-4" />}
                        />
                    ))}
                </div>

                <div className="flex gap-2 w-full lg:w-auto">
                    <button
                        onClick={() => {
                            setSearchTerm(inputValue);
                            setActiveFilters(filterInput);
                        }}
                        className="flex-1 lg:flex-none px-4 py-2 text-sm rounded-lg bg-primary text-white transition-all duration-200 active:scale-95 hover:brightness-110"
                    >
                        Tìm kiếm
                    </button>
                    <button
                        onClick={() => {
                            setInputValue("");
                            setSearchTerm("");
                            setFilterInput({});
                            setActiveFilters({});
                        }}
                        className="px-3 py-2 text-sm rounded-lg bg-gray-200 text-gray-600 transition-all duration-200 active:scale-95 hover:bg-gray-300"
                    >
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>

                {/* RIGHT SLOT */}
                {searchRight && (
                    <div className="lg:ml-auto w-full lg:w-auto flex justify-end">
                        {searchRight}
                    </div>
                )}
            </div>

            {/* Table */}
            <div className={`px-3 md:px-6 lg:px-8 py-3 flex-1 overflow-auto ${tableMaxHeightClass || ""}`}>
                <div className="w-full rounded-lg border border-gray-200 overflow-auto">
                    <table className="w-full border-collapse text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur border-b border-gray-200">
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

                                {(onView || onEdit || onDelete) && (
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
                                            className={`transition-colors
                                                ${isDeleted
                                                    ? "bg-gray-50 text-gray-400"
                                                    : "bg-white hover:bg-primary/5"}`}
                                        >
                                            <td className="px-4 py-3 text-center text-gray-500">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>

                                            {columns.map((col, idx) => (
                                                <td
                                                    key={idx}
                                                    className="px-4 py-3 text-gray-700 max-w-[300px] truncate"
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
                                                                onChange={() => toggleStatus(item)}
                                                                disabled={!onStatusChange}
                                                            />
                                                            <span
                                                                className={`text-[9px] font-medium uppercase
                                                                    ${item[statusField]
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
                                                                onChange={() => { }}
                                                            />
                                                            <span className={`text-[9px] font-medium uppercase text-gray-400`}                                                            >
                                                                Đã xóa
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            )}

                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {!isDeleted && onView && (
                                                        <button
                                                            onClick={() => onView(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition active:scale-90"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                    )}

                                                    {!isDeleted && onEdit && (
                                                        <button
                                                            onClick={() => onEdit(item)}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition active:scale-90"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                    )}

                                                    {!isDeleted && onDelete && (
                                                        <button
                                                            onClick={() => onDelete(item)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition active:scale-90"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}

                                                    {isDeleted && onRestore && (
                                                        <button
                                                            onClick={() => onRestore(item)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition active:scale-90"
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
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="border border-gray-200 rounded-lg px-2 py-1 bg-white cursor-pointer outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {[5, 10, 20, 50, 100, pageSize]
                                .filter((val) => val > 0) // Chỉ lấy số dương
                                .filter((val, i, self) => self.indexOf(val) === i)
                                .sort((a, b) => a - b)
                                .map((size) => (
                                    <option key={size} value={size}>{size} / trang</option>
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
                    <span className="px-3 py-1 text-sm font-medium text-gray-700">
                        {totalPages === 0 ? "0/0" : `${currentPage}/${totalPages}`}
                    </span>
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
