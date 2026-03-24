import { useState } from "react";

const CategoryTabs = ({ categories, active, onChange }: any) => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    return (
        <div className="bg-white border-b border-gray-100 px-4 shrink-0">
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {categories.map((cat: any) => {
                    const isActive = active === cat.category_id;
                    const isHovered = hoveredId === cat.category_id;

                    return (
                        <button
                            key={cat.category_id}
                            onClick={() => onChange(cat.category_id)}
                            onMouseEnter={() => setHoveredId(cat.category_id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className={`
                                relative px-5 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer
                                ${isActive
                                    ? "text-primary"
                                    : "text-gray-600 hover:text-gray-800"
                                }
                            `}
                        >
                            {cat.category_name}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                            )}
                            {!isActive && isHovered && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300 rounded-full" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryTabs;