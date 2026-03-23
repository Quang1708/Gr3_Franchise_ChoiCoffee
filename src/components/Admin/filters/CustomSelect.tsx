import { useDebounce } from "@/hooks/useDebounce";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import React, { useCallback, useMemo, useRef, useState } from "react";

interface Option {
  value: string;
  label: string;
}

interface PageInfo {
  pageNum: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface CustomSelectProps {
  searchKey?: string; // thêm prop searchKey để hỗ trợ tìm kiếm theo key khác với value
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  options?: Option[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  fetchOptions?: (params: {
    pageNum: number;
    pageSize: number;
    searchKey?: string;
  }) => Promise<{ data: Option[]; pageInfo: PageInfo }>;
  position?: "top" | "bottom";
}

const PAGE_SIZE = 10;

const CustomSelect: React.FC<CustomSelectProps> = ({
  fetchOptions,
  value,
  onChange,
  disabled = false,
  options: staticOptions = [],
  placeholder,
  icon,
  className,
  position = "bottom",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [apiOptions, setApiOptions] = useState<Option[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const debouncedSearch = useDebounce(search, 500);

  const combinedOptions = useMemo(() => {
    const combined = [...staticOptions, ...apiOptions];
    // Loại bỏ các phần tử trùng value (ưu tiên staticOptions)
    return combined.filter(
      (v, i, a) => a.findIndex((t) => t.value === v.value) === i,
    );
  }, [staticOptions, apiOptions]);

  const lastOptionRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  const loadData = async (
    searchKey: string,
    pageNum: number,
    isNewSearch: boolean,
  ) => {
    setLoading(true);
    try {
      const response = await fetchOptions?.({
        pageNum,
        pageSize: PAGE_SIZE,
        searchKey,
      });

      const { data, pageInfo } = response || {
        data: [],
        pageInfo: {
          pageNum: 1,
          pageSize: PAGE_SIZE,
          totalItems: 0,
          totalPages: 0,
        },
      };

      setApiOptions((prev) => (isNewSearch ? data : [...prev, ...data]));
      setHasMore(pageInfo.pageNum < pageInfo.totalPages);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setPage(1);
    loadData(debouncedSearch, 1, true);
  }, [debouncedSearch]);

  // Load thêm dữ liệu khi page tăng (do infinite scroll trigger)
  React.useEffect(() => {
    if (page > 1) {
      loadData(debouncedSearch, page, false);
    }
  }, [page]);

  React.useEffect(() => {
    if (!value) {
      setSearch("");
      setApiOptions([]);
      setPage(1);
      setHasMore(true);
    }
  }, [value]);


  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = combinedOptions.find((opt) => opt.value === value);

  return (
    <div
      className={`relative w-full ${className || "sm:min-w-[200px]"}`}
      ref={containerRef}
    >
      <div
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm bg-white border rounded-lg cursor-pointer transition-all select-none
            ${disabled
              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
              : isOpen
                ? "border-primary ring-2 ring-primary/20"
                : "border-gray-200 hover:border-gray-300"}`}
      >
        {icon && <span className="text-gray-500">{icon}</span>}
        <span
          className={`flex-1 truncate ${
            disabled
              ? "text-gray-500"
              : !selectedOption
                ? "text-gray-500"
                : "text-gray-700"
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder || "Chọn..."}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen && !disabled ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div
          className={`absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto mt-1 ${position === "top" ? "bottom-full mb-1" : "mt-1"}`}
        >
          {fetchOptions && (
            <div className="p-2 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                autoFocus
                className="w-full text-sm outline-none bg-transparent"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          )}

          <div className="p-1">
            {combinedOptions.map((opt, index) => (
              <div
                key={opt.value}
                ref={
                  index === combinedOptions.length - 1 ? lastOptionRef : null
                }
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer ${opt.value === value ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && <Check className="w-3.5 h-3.5" />}
              </div>
            ))}

            {loading && (
              <div className="flex justify-center p-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}

            {!loading && combinedOptions.length === 0 && (
              <div className="p-3 text-center text-xs text-gray-400">
                Không tìm thấy dữ liệu
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
