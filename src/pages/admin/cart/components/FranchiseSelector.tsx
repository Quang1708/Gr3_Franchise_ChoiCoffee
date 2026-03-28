import { useState } from "react";
import { Store, ChevronRight, RotateCw, Search } from "lucide-react";
import ClientLoading from "@/components/Client/Client.Loading";

type Props = {
    data: any[];
    onSelect: (id: string) => void;
    loading?: boolean;
    onRefresh?: () => void;
};

const FranchiseSelector = ({ data, onSelect, loading, onRefresh }: Props) => {
    const [inputValue, setInputValue] = useState("");
    const [filterQuery, setFilterQuery] = useState("");

    // ===== ACTION =====
    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        setFilterQuery(inputValue.trim().toLowerCase());
    };

    const handleRefresh = () => {
        setInputValue("");
        setFilterQuery("");
        onRefresh?.();
    };

    // ===== FILTER =====
    const filteredData = data.filter((f) =>
        f.name?.toLowerCase().includes(filterQuery)
    );

    // ===== LOADING =====
    if (loading) return <ClientLoading />;

    return (
        <div className="flex flex-col overflow-hidden bg-gray-50">
            {/* ===== HEADER ===== */}
            <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-3 shrink-0">
                <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                    {/* INPUT */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Tìm chi nhánh..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-[13px]
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        />
                    </div>

                    {/* SEARCH */}
                    <button
                        type="submit"
                        className="px-4 py-2 text-[12px] bg-primary text-white rounded-lg hover:brightness-110 transition cursor-pointer"
                    >
                        Tìm kiếm
                    </button>

                    {/* REFRESH */}
                    <button
                        title="Làm mới"
                        type="button"
                        onClick={handleRefresh}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                        <RotateCw className="w-4 h-4 text-gray-500" />
                    </button>
                </form>
            </div>

            {/* ===== LIST ===== */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5">
                {filteredData.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-[13px] text-gray-400 italic">
                            Không tìm thấy chi nhánh
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredData.map((f) => (
                            <div
                                key={f.value}
                                onClick={() => onSelect(f.value)}
                                className="
                  bg-white border border-gray-200 rounded-xl p-4 cursor-pointer
                  hover:border-primary hover:shadow-sm transition group
                "
                            >
                                {/* ICON */}
                                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-3">
                                    <Store className="w-4 h-4" />
                                </div>

                                {/* NAME */}
                                <h3 className="text-[13px] font-medium text-gray-800 line-clamp-1 group-hover:text-primary transition">
                                    {f.name}
                                </h3>

                                {/* FOOTER */}
                                <div className="flex items-center justify-between mt-3 text-[11px] text-gray-400">
                                    <span>Truy cập</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FranchiseSelector;