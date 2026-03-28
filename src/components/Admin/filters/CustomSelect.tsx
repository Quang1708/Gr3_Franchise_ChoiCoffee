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
  searchKey?: string;
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
  fetchOnSearchOnly?: boolean;
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
  fetchOnSearchOnly = false,
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
    return combined.filter(
      (v, i, a) => a.findIndex((t) => t.value === v.value) === i,
    );
  }, [staticOptions, apiOptions]);

  const selectedOption = combinedOptions.find((opt) => String(opt.value) === String(value));

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
        pageInfo: { pageNum: 1, pageSize: PAGE_SIZE, totalItems: 0, totalPages: 0 },
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
    if (fetchOnSearchOnly && !debouncedSearch.trim()) {
      setApiOptions([]);
      setHasMore(false);
      return;
    }
    setPage(1);
    loadData(debouncedSearch, 1, true);
  }, [debouncedSearch, fetchOnSearchOnly]);

  React.useEffect(() => {
    if (page > 1) {
      loadData(debouncedSearch, page, false);
    }
  }, [page]);

  // LOGIC ĐỒNG BỘ: Tự động khôi phục chữ khi click ra ngoài (đóng dropdown)
  React.useEffect(() => {
    if (!isOpen) {
      if (fetchOnSearchOnly) {
        if (value && selectedOption) {
          setSearch(selectedOption.label); // Khôi phục lại label của voucher đang chọn
        } else if (!value) {
          setSearch(""); // Nếu không có value thì mới xoá chữ
        }
      } else {
        setSearch(""); // Reset cho select thông thường khi đóng
      }
    }
  }, [isOpen, value, selectedOption, fetchOnSearchOnly]);


  // Bắt sự kiện Click Outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false); // Khi set lại false, useEffect đồng bộ bên trên sẽ tự chạy để khôi phục chữ
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className || "sm:min-w-[200px]"}`} ref={containerRef}>
      <div
        onClick={() => {
          if (disabled) return;
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all 
            ${
              disabled
                ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                : isOpen
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-gray-200 hover:border-gray-300 cursor-pointer"
            }`}
      >
        {icon && <span className="text-gray-500">{icon}</span>}
        
        {/* Render input text nếu là fetchOnSearchOnly, ngược lại render span text */}
        {fetchOnSearchOnly ? (
          <input
            className="flex-1 w-full bg-transparent outline-none truncate text-gray-700 placeholder-gray-400"
            placeholder={placeholder || "Tìm kiếm..."}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              // CHỈ XOÁ value khi người dùng xoá sạch text trong ô input
              if (e.target.value.trim() === "" && value) {
                onChange("");
              }
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
          />
        ) : (
          <span
            className={`flex-1 truncate select-none ${
              disabled || !selectedOption ? "text-gray-500" : "text-gray-700"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder || "Chọn..."}
          </span>
        )}

        {/* Thay đổi icon mủi tên thành kính lúp nếu ở dạng thanh tìm kiếm */}
        {fetchOnSearchOnly ? (
          <Search className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen && !disabled ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className={`absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto mt-1 ${
            position === "top" ? "bottom-full mb-1" : "mt-1"
          }`}
        >
          {/* Chỉ hiện thanh search bên trong nếu KHÔNG PHẢI chế độ fetchOnSearchOnly */}
          {fetchOptions && !fetchOnSearchOnly && (
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
                ref={index === combinedOptions.length - 1 ? lastOptionRef : null}
                onClick={() => {
                  onChange(opt.value);
                  if (fetchOnSearchOnly) setSearch(opt.label); // Gán thẳng label vào thanh search chính
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer ${
                  String(opt.value) === String(value)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {String(opt.value) === String(value) && <Check className="w-3.5 h-3.5" />}
              </div>
            ))}

            {loading && (
              <div className="flex justify-center p-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}

            {!loading && combinedOptions.length === 0 && (
              <div className="p-3 text-center text-xs text-gray-400">
                {fetchOnSearchOnly && !search.trim()
                  ? "Vui lòng nhập từ khóa để tìm kiếm..."
                  : "Không tìm thấy dữ liệu"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;